const express = require('express');
const router = express.Router();
const formationController = require('../Controller/formationControlller');

router.post('/createFormation', formationController.createFormation);
router.get('/getAllFormations', formationController.getAllFormations);
router.put('/updateFormation/:id', formationController.updateFormation);
router.delete('/deleteFormation/:id', formationController.deleteFormation);

module.exports = router;
