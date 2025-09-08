const express = require('express');
const router = express.Router();

// Controllers
const congeController = require('../Controller/congesController');
// Utilisateur

// Demande de congés
router.post('/creerConge', congeController.creerConge);
router.get('/getAllConges', congeController.getAllConges);
router.get('/getCongeById/:id', congeController.getCongeById);
router.put('/updateEtatConge/:id', congeController.updateEtatConge);
router.delete('/supprimerConge/:id', congeController.supprimerConge);
// les approvation de refuser
router.put('/approuverConge/:id', congeController.approuverConge);
router.put('/refuserConge/:id', congeController.refuserConge);


module.exports = router;

