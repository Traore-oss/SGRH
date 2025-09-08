const express = require("express"); // ← il faut remettre ça !
const router = express.Router();
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");

// 🔹 Configuration Multer pour uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// 🔹 Import des contrôleurs
const utilisateurController = require("../Controller/UtilisateurController");
const authController = require("../Controller/AuthController");

// ----------------------- ROUTES -----------------------

// 1️⃣ Créer le premier admin (sans auth)
router.post("/signUp", utilisateurController.createFirstAdmin);

// 2️⃣ Connexion / déconnexion / check
router.post("/signIn", authController.signIn);
router.post("/logout", authController.logout);
router.get("/check", authController.checkAuth);

// 3️⃣ Gestion des employés (Admin uniquement)
router.post(
  "/creerEmployer",
  authController.requireAuth,
  authController.requireAdmin,
  upload.single("photo"),
  utilisateurController.creerEmployer
);

router.get(
  "/getAllEmployees",
  authController.requireAuth,
  authController.requireAdmin,
  utilisateurController.getAllEmployees
);

router.put(
  "/updateEmployee/:id",
  authController.requireAuth,
  authController.requireAdmin,
  upload.single("photo"),
  utilisateurController.updateEmployee
);

router.patch(
  "/activateEmployee/:id",
  authController.requireAuth,
  authController.requireAdmin,
  utilisateurController.activateEmployee
);

router.patch(
  "/deactivateEmployee/:id",
  authController.requireAuth,
  authController.requireAdmin,
  utilisateurController.deactivateEmployee
);

module.exports = router;
