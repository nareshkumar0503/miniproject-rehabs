const express = require('express');
const router = express.Router();
const patientctrl = require('../controllers/registration');


router.get('/patientregistration', patientctrl.getPatientRegister);
router.post('/patientregister', patientctrl.postPatientRegister);

module.exports = router;