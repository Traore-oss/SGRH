const express = require('express');
const router = express.Router();
const departementController = require('../Controller/departementController');
const { requireAuth } = require('../midlewere/authmidleware');

// CRUD Départements
router.post('/createDepartement',requireAuth, departementController.createDepartement);
router.get('/getAllDepartements', requireAuth, departementController.getAllDepartements);
router.put('/updateDepartement/:code_departement', requireAuth, departementController.updateDepartement);
router.delete('/deleteDepartement/:code_departement', requireAuth, departementController.deleteDepartement);

module.exports = router;