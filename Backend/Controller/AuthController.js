const Utilisateur = require("../Models/usersModel");
const { createToken, maxAge } = require("../Utile/jwt");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Connexion
exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email et mot de passe requis" });

    const user = await Utilisateur.findOne({ email }).select("+password");
    if (!user || !user.isActive)
      return res.status(401).json({ error: "Utilisateur non activé ou inexistant" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });

    const token = createToken(user._id);
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge,
    });

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Déconnexion
exports.logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 1,
    });
    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Vérification auth
exports.checkAuth = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(200).json({ user: null });

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Utilisateur.findById(decodedToken.id).select("-password");
    if (!user || !user.isActive) return res.status(200).json({ user: null });

    res.status(200).json({ user });
  } catch (error) {
    res.status(200).json({ user: null });
  }
};

// ✅ Middleware pour vérifier que l'utilisateur est connecté
exports.requireAuth = async (req, res, next) => {
  const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token manquant" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
    if (err) return res.status(401).json({ error: "Token invalide" });

    try {
      const user = await Utilisateur.findById(decodedToken.id);
      if (!user || !user.isActive) return res.status(403).json({ error: "Compte désactivé ou inexistant" });
      req.user = user;
      next();
    } catch {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
};

// ✅ Middleware pour vérifier que l'utilisateur est Admin
exports.requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "Admin") return next();
  return res.status(403).json({ error: "Accès refusé, admin requis" });
};
