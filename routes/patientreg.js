const express = require('express');
const router = express.Router();
const Patient = require('../models/patientSchema');

router.post('/patientregister', async (req, res) => {
    const userId = req.session.userId;
    const email = req.session.email;
    const username = req.session.username;

    const {
        role, // New field for role (Patient or Attender)
        password, name, age, bloodGroup, gender, height,
        weight, contactNumber, address,
        addictionType, addictionDurationValue, addictionDurationUnit,
        frequencyOfUse, previousTreatmentHistory, currentPhysicalHealth, currentMentalHealth,
        addictionQuestion1, addictionQuestion2, addictionQuestion3 // New questions based on addiction type
    } = req.body;

    try {
        const addictionDuration = `${addictionDurationValue} ${addictionDurationUnit}`;
        const patient = await Patient.findOne({ email: email });

        if (patient) {
            res.redirect('/');
        } else {
            const newPatient = new Patient({
                userId, username, password, name, age, bloodGroup, gender, height, weight,
                address, contactNumber, email, addictionType, addictionDuration,
                frequencyOfUse, previousTreatmentHistory, currentPhysicalHealth, currentMentalHealth,
                addictionQuestion1, addictionQuestion2, addictionQuestion3, role // Store role and addiction-specific answers
            });
            await newPatient.save();
            res.redirect('/');
        }
    } catch (err) {
        console.log(err.message);
        res.redirect('/error');
    }
});

router.get('/patientregistration', (req, res) => {
    const username = null;
    const email = null;
    res.render('patientreg', { username, email });
});

module.exports = router;
