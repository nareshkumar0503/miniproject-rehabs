const express = require('express');
const router = express.Router();
const registerCtrl = require('../controllers/registration');
const multer = require('multer');


// ------Patientregister------Patientregister------Patientregister------Patientregister------Patientregister------Patientregister
router.get('/patientregistration', registerCtrl.getPatientRegister);
router.post('/patientregister', registerCtrl.postPatientRegister);
// ------------------------------------------------------------------------------------------------------------------------------

// ------Centerregister------Centerregister------Centerregister------Centerregister------Centerregister------Centerregister------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });

const upload = multer({ storage: storage });

router.get('/centerregistration', registerCtrl.getCenterRegister);
router.post('/centerregister', upload.array('centerImages', 10), registerCtrl.postCenterRegister);

// ------------------------------------------------------------------------------------------------------------------------------

module.exports = router; 