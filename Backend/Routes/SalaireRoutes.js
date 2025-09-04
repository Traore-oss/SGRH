const express = require('express');
const router = express.Router();
const salaireController = require('../Controller/SalaireController');

router.post('/calculerSalaire', salaireController.calculerSalaire);
router.get('/getAllSalaires', salaireController.getAllSalaires);

module.exports = router;
