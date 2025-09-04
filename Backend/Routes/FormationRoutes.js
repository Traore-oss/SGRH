const express = require('express');
const router = express.Router();
const formationController = require('../Controller/formationControlller');

router.post('/formations', formationController.createFormation);
router.get('/formations', formationController.getAllFormations);
router.put('/formations/:id', formationController.updateFormation);
router.delete('/formations/:id', formationController.deleteFormation);

module.exports = router;
