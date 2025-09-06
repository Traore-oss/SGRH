const express = require('express');
const router = express.Router();
const performanceController = require('../Controller/performanceController');

// CRUD complet sur /api/performances
router.post('/performances', performanceController.ajouterPerformance);
router.get('/performances', performanceController.getAllPerformances);
router.put('/performances/:id', performanceController.updatePerformance);
router.delete('/performances/:id', performanceController.deletePerformance);

module.exports = router;