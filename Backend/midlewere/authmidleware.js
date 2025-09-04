const jwt = require("jsonwebtoken");
const UserModel = require("../Models/usersModel");

// ✅ Vérifie si l'utilisateur est connecté (pour templates / views)
module.exports.checkUser = async (req, res, next) => {
  const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        res.cookie("jwt", "", { maxAge: 1 });
        return next();
      }
      try {
        const user = await UserModel.findById(decodedToken.id).select("-password");
        res.locals.user = user || null;
      } catch {
        res.locals.user = null;
      }
      next();
    });
  } else {
    res.locals.user = null;
    next();
  }
};

// ✅ Middleware pour vérifier que l'utilisateur est connecté
module.exports.requireAuth = async (req, res, next) => {
  const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token manquant" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
    if (err) return res.status(401).json({ error: "Token invalide" });

    try {
      const user = await UserModel.findById(decodedToken.id);
      if (!user || !user.isActive) {
        return res.status(403).json({ error: "Compte désactivé ou inexistant" });
      }
      req.user = user;
      next();
    } catch {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
};

// ✅ Middleware pour vérifier que l'utilisateur est Admin
module.exports.requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "Admin") {
    return next();
  }
  return res.status(403).json({ error: "Accès refusé, admin requis" });
};
