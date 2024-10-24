const express = require('express');
const router = express.Router();
const registerCtrl = require('../controllers/registration');
const multer = require('multer');
const path = require('path');

// ------Patientregister------Patientregister------Patientregister------Patientregister------Patientregister------Patientregister
router.get('/patientregistration', registerCtrl.getPatientRegister);
router.post('/patientregister', registerCtrl.postPatientRegister);
// ------------------------------------------------------------------------------------------------------------------------------

// ------Centerregister------Centerregister------Centerregister------Centerregister------Centerregister------Centerregister------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure the 'uploads' folder exists
        const uploadPath = path.join(__dirname, '../public/uploads/');
        cb(null, uploadPath);  // Save files in the public/uploads folder
    },
    filename: (req, file, cb) => {
        cb(null,file.originalname);  // Use timestamp + original file name to avoid conflicts
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG and PNG are allowed!'), false);
        }
    }
});

// Center registration routes
router.get('/centerregistration', registerCtrl.getCenterRegister);
router.post('/centerregister', upload.array('centerImages', 10), registerCtrl.postCenterRegister);
// ------------------------------------------------------------------------------------------------------------------------------

module.exports = router;
