const express = require('express');
const router = express.Router();
const attendanceController = require('../Controller/attendanceController');

// Créer ou récupérer des présences
router.post('/addAttendance', attendanceController.addAttendance);
router.get('/getByDate/:date', attendanceController.getAttendances);

// Mettre à jour l'arrivée
router.put('/updatePresence/:id', attendanceController.updatePresence);

// Marquer le départ
router.put('/setDeparture/:id', attendanceController.setDeparture);

// Supprimer une présence
router.delete('/deleteAttendance/:id', attendanceController.deleteAttendance);

module.exports = router;
