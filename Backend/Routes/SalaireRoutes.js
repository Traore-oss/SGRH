const express = require("express");
const router = express.Router();
const paiementController = require("../Controller/SalaireController");
const { requireAuth } = require("../midlewere/authmidleware");

// Routes CRUD Paiements
router.post("/",requireAuth, paiementController.creerPaiement);
router.get("/",requireAuth, paiementController.getPaiements);
router.get("/:id",requireAuth, paiementController.getPaiementById);
router.put("/:id", requireAuth,paiementController.updatePaiement);
router.delete("/:id",requireAuth, paiementController.deletePaiement);

module.exports = router;
