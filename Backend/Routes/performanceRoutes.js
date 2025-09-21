const express = require('express');
const router = express.Router();
const performanceController = require('../Controller/performanceController');
const { requireAuth } = require('../midlewere/authmidleware');

// CRUD complet sur /api/performances
router.use(requireAuth);

router.post('/',requireAuth, performanceController.ajouterPerformance);
router.get('/',requireAuth, performanceController.getAllPerformances);
router.get('/:id',requireAuth, performanceController.getPerformanceById);
router.put('/:id', requireAuth, performanceController.updatePerformance);
router.delete('/:id',requireAuth, performanceController.deletePerformance);

module.exports = router;
