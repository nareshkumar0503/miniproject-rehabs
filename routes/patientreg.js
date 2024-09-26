const express = require('express');
const router = express.Router();
const Patient = require('../models/patientSchema');

router.post('/patientregister', async (req, res) => {
    // Destructure request body and set default values for null or undefined fields
    const {
        patientname = "", // Default to an empty string if no value is provided
        attendername = "", 
        patientage = 0, // Default to 0 if no age is provided
        bloodgroup = "Unknown", // Default to "Unknown" if no blood group is provided
        gender = "Other", // Default to "Other" for gender if not specified
        height = 0, // Default to 0 if height is not provided
        weight = 0, // Default to 0 if weight is not provided
        address = "", // Default to empty string for address
        password = "", // Default to an empty string
        patientcontactnumber = "", // Default to empty string for contact number
        attendercontactnumber = "", 
        email = "", // Default to empty string for email
        addictionType = "Not Specified", // Default to "Not Specified"
        addictionDurationValue = 0, // Default to 0 if addiction duration is not provided
        addictionDurationUnit = "days", // Default to "days" if no duration unit is provided
        frequencyOfUse = "Not Specified", // Default to "Not Specified"
        previousTreatmentHistory = "None", // Default to "None" if no history is provided
        currentPhysicalHealth = "Not Provided" // Default to "Not Provided"
    } = req.body;

    try {
        // Combine addiction duration value and unit
        const addictionDuration = `${addictionDurationValue} ${addictionDurationUnit}`;

        // Check if the patient with the provided email already exists
        const patient = await Patient.findOne({ email: email });

        if (patient) {
            // Redirect to home if the patient already exists
            res.redirect('/');
        } else {
            // Create new patient record
            const newPatient = new Patient({
                patientname, 
                attendername,
                patientage, 
                patientbloodgroup, 
                gender, 
                height, 
                weight, 
                address, 
                password, 
                patientcontactnumber, 
                attendercontactnumber, 
                email, 
                addictionType, 
                addictionDuration, 
                frequencyOfUse, 
                previousTreatmentHistory, 
                currentPhysicalHealth
            });

            // Save the new patient record in the database
            await newPatient.save();
            // Redirect to home after successful registration
            res.redirect('/');
        }
    } catch (err) {
        console.log(err.message);
        // Redirect to error page if there's any issue
        res.redirect('/patientregister');
    }
});

module.exports = router;

router.get('/patientregistration', (req, res) => {
    const email = req.session.email;
    res.render('patientreg', { username, email });
});

module.exports = router;
