const express = require("express");
const router = express.Router();
const userController = require("../Controller/UtilisateurController");
const { requireAuth } = require("../midlewere/authmidleware"); // Middleware pour JWT si nécessaire
const { getEmployeeStats } = require("../Controller/statController");


// === Gestion utilisateurs ===
// Créer un utilisateur (Admin/RH/Employe)
router.post("/",requireAuth,userController.createUser);

// Récupérer tous les utilisateurs
router.get("/", requireAuth, userController.getUsers);

// Récupérer un utilisateur par id
router.get("/:id", requireAuth, userController.getUserById);

// Mettre à jour un utilisateur
router.put("/:id", requireAuth, userController.updateUser);

router.get('/stats/:id', requireAuth, getEmployeeStats);

module.exports = router;
