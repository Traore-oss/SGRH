const express = require('express');
const router = express.Router();
const formationController = require('../Controller/formationControlller');
const { requireAuth } = require('../midlewere/authmidleware');

router.post('/createFormation', requireAuth, formationController.createFormation);
router.get('/getAllFormations', requireAuth, formationController.getAllFormations);
router.put('/updateFormation/:id', requireAuth, formationController.updateFormation);
router.delete('/deleteFormation/:id', requireAuth, formationController.deleteFormation);

module.exports = router;
