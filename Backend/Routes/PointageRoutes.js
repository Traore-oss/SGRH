const express = require('express');
const router = express.Router();
const attendanceController = require('../Controller/attendanceController');
const { requireAuth } = require('../midlewere/authmidleware');

// Récupérer les présences (passer la date en query)
router.get('/getAttendances', requireAuth, attendanceController.getAttendances);

// Mettre à jour l'arrivée
router.put('/updatePresence', requireAuth, attendanceController.updatePresence);

// Marquer le départ
router.put('/setDeparture', requireAuth, attendanceController.setDeparture);


module.exports = router;