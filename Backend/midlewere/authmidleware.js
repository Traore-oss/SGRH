// middlewere/authmidleware.js
const jwt = require("jsonwebtoken");
const Utilisateur = require("../Models/usersModel");

const requireAuth = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).json({ message: "Accès non autorisé, token manquant" });

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id || decodedToken._id;
    const user = await Utilisateur.findById(userId).select("-password");
    if (!user) return res.status(401).json({ message: "Utilisateur introuvable" });

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

const checkAuth = async (req, res) => {
  const token = req.cookies.jwt;
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
