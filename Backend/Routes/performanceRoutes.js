const express = require('express');
const router = express.Router();
const performanceController = require('../Controller/performanceController');

// CRUD complet sur /api/performances
router.post('/', performanceController.ajouterPerformance);
router.get('/', performanceController.getAllPerformances);
router.put('/:id', performanceController.updatePerformance);
router.delete('/:id', performanceController.deletePerformance);

module.exports = router;