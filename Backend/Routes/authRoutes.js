// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../Controller/AuthController");
const { requireAuth, checkAuth } = require("../midlewere/authmidleware"); // Middleware pour JWT

// === Authentification ===
// Connexion
router.post("/login", userController.signIn);

// Déconnexion
router.get("/logout", userController.logout);

// Vérifier si utilisateur connecté
router.get("/check", checkAuth);

// Activer / désactiver un utilisateur
router.patch("/toggleActive/:id", requireAuth, userController.toggleActive);

module.exports = router;
