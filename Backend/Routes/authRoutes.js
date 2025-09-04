const express = require("express");
const router = express.Router();
const { signIn,logout, checkAuth } = require("../Controller/AuthController");

// Connexion
router.post("/signIn", signIn);

// Déconnexion
router.post("/logout", logout);

// Vérification auth
router.get("/check", checkAuth);

module.exports = router;