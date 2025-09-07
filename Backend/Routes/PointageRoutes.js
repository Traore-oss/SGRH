const express = require('express');
const router = express.Router();
const attendanceController = require('../Controller/attendanceController');

// Ajouter une présence
router.post('/addAttendance', attendanceController.addAttendance);

// Récupérer les présences (passer la date en query)
router.get('/getByDate', attendanceController.getAttendances);

// Mettre à jour l'arrivée
router.put('/updatePresence', attendanceController.updatePresence);

// Marquer le départ
router.put('/setDeparture', attendanceController.setDeparture);

// Supprimer une présence
router.delete('/deleteAttendance/:id', attendanceController.deleteAttendance);

module.exports = router;