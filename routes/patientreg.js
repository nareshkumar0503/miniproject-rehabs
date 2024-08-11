const express = require('express');
const router = express.Router();
const Patient = require('../models/patientSchema');


router.post('/patientregister', async(req,res) =>{

    const userId = req.session.userId;
    const email = req.session.email;
    const username = req.session.username;
    const {   password, name, age, gender, address, contactNumber,  addictionType,  addictionDurationValue, addictionDurationUnit,
        frequencyOfUse,
        previousTreatmentHistory,
        currentPhysicalHealth,
        currentMentalHealth} = req.body;
    
    try {
        const addictionDuration = `${addictionDurationValue} ${addictionDurationUnit}`;
        const patient = await Patient.findOne({email : email});
        if(patient){
            res.redirect('/');
        }else{
            const newPatient = new Patient({    
                userId, username, password, name, age, gender, address, contactNumber, email, addictionType, addictionDuration,
                frequencyOfUse,
                previousTreatmentHistory,
                currentPhysicalHealth,
                currentMentalHealth
            });
            console.log(newPatient);
            await newPatient.save();
            res.redirect('/');
        }
    }catch(err){
        console.log(err.message);
    }
});

module.exports = router;