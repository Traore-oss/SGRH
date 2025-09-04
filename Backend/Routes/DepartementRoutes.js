const express = require('express');
const router = express.Router();
const departementController = require('../Controller/departementController');

// CRUD Départements
router.post('/createDepartement', departementController.createDepartement);
router.get('/getAllDepartements', departementController.getAllDepartements);
router.put('/updateDepartement/:code_departement', departementController.updateDepartement);
router.delete('/deleteDepartement/:code_departement', departementController.deleteDepartement);

module.exports = router;
