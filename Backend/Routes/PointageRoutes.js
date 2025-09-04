const express = require('express');
const router = express.Router();
const controller = require('../Controller/PointageController');

router.post('/addAttendance', controller.addAttendance);
router.put('/updatePresence', controller.updatePresence);
router.put('/setDeparture', controller.setDeparture);
router.get('/getAttendances', controller.getAttendances);

module.exports = router;
