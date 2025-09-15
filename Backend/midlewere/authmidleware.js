const jwt = require("jsonwebtoken");
const Utilisateur = require("../Models/usersModel");

// Middleware pour protéger les routes
const requireAuth = async (req, res, next) => {
  let token = null;

  // Vérifier si le token est dans les cookies
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // Vérifier si le token est dans l'en-tête Authorization
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Accès non autorisé, token manquant" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id || decodedToken._id;
    const user = await Utilisateur.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Utilisateur introuvable" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Erreur requireAuth:", err.message);
    res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

// Vérifier l'authentification sans bloquer la route
const checkAuth = async (req, res) => {
  let token = null;

  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) return res.status(200).json({ user: null });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded._id;
    const user = await Utilisateur.findById(userId).select("-password");
    res.status(200).json({ user: user || null });
  } catch (err) {
    console.error("Erreur checkAuth:", err.message);
    res.status(200).json({ user: null });
  }
};

module.exports = { requireAuth, checkAuth };
