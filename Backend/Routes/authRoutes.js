const express = require("express");
const router = express.Router();
const authController = require("../Controller/AuthController");

// 🔹 Authentification
router.post("/login", authController.signIn);
router.get("/logout", authController.logout);

// 🔹 Gestion utilisateurs
router.patch('/toggle-active/:id',authController.toggleActive);
// 🔹 Mot de passe oublié / réinitialisation
router.post("/forgot-password", authController.forgotPassword);          // Envoi du mail
router.get("/verify-reset-token/:token", authController.verifyResetToken); // Vérifie si le token est valide
router.post("/reset-password/:token", authController.resetPassword);     // Réinitialise le mot de passe

module.exports = router;
