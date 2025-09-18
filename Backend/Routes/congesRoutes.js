const express = require('express');
const router = express.Router();
const congeController = require('../Controller/congesController');
const { requireAuth } = require("../midlewere/authmidleware");

// ➕ Créer un congé
router.post('/creerConge', requireAuth, congeController.creerConge);

// 🔄 Récupérer tous les congés
router.get('/getAllConges', requireAuth, congeController.getAllConges);

// ✅ Approuver un congé
router.put('/approuverConge/:id', requireAuth, congeController.approuverConge);

// ❌ Refuser un congé
router.put('/refuserConge/:id', requireAuth, congeController.refuserConge);

// 🗑️ Supprimer un congé (Admin seulement)
router.delete('/supprimerConge/:id', requireAuth, congeController.supprimerConge);

module.exports = router;
