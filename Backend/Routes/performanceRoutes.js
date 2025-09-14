const express = require('express');
const router = express.Router();
const performanceController = require('../Controller/performanceController');
const { requireAuth } = require('../midlewere/authmidleware');

// CRUD complet sur /api/performances
router.use(requireAuth);

router.post('/', performanceController.ajouterPerformance);
router.get('/', performanceController.getAllPerformances);
router.get('/:id', performanceController.getPerformanceById);
router.put('/:id', performanceController.updatePerformance);
router.delete('/:id', performanceController.deletePerformance);

module.exports = router;
