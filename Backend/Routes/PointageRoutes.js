const express = require('express');
const router = express.Router();
const attendanceController = require('../Controller/attendanceController');
const { requireAuth } = require('../midlewere/authmidleware');

// Récupérer les présences (passer la date en query)
router.get('/', requireAuth, attendanceController.getAttendances);

// Pointer l’arrivée (peut être Admin, RH ou Employé pour lui-même)
router.put('/arrivee', requireAuth, attendanceController.updatePresence);

// Pointer le départ
router.put('/depart', requireAuth, attendanceController.setDeparture);
// Pointer plusieurs présences en bulk
router.put('/bulk', requireAuth, attendanceController.updatePresenceBulk);

module.exports = router;
