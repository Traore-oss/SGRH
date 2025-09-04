// routes/performanceRoutes.js
const express = require('express');
const router = express.Router();
const performanceController = require('../Controller/evalutationController');

// 🔹 Ajouter une performance
router.post('/ajouterPerformance', performanceController.ajouterPerformance);

// 🔹 Lister toutes les performances
router.get('/getAllPerformances', performanceController.getAllPerformances);

// 🔹 Modifier une performance
router.put('/updatePerformance/:id', performanceController.updatePerformance);

// 🔹 Supprimer une performance
router.delete('/deletePerformance/:id', performanceController.deletePerformance);

module.exports = router;
