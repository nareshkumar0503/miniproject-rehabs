const Patient = require('../models/patientSchema');
const Center = require('../models/Center');
// ------patient registration------patient registration------patient registration------patient registration------patient registration-------

// get patient register page
exports.getPatientRegister = (req, res) => {
    const email ='';
      res.render('patientreg', {email});
};

// post patient register
exports.postPatientRegister = async (req, res) => {
    // Destructure request body and set default values for null or undefined fields
    
    const {
        patientname = "", 
        attendername = "",
        patientage = 0, 
        bloodgroup = "Unknown", 
        gender = "Other", 
        height = 0, 
        weight = 0, 
        address = "", 
        password = "", 
        patientcontactnumber = "", 
        attendercontactnumber = "",
        email = "", 
        addictionType = "Not Specified", 
        addictionDuration = "", 
        frequencyOfUse = "Not Specified", 
        previousTreatmentHistory = "None", 
    } = req.body;

    try {
        // Check if the patient with the provided email already exists
        const existingPatient = await Patient.findOne({ email: email });

        if (existingPatient) {
            // Send a 400 status with an error message
            return res.status(400).json({ message: 'Patient already exists.' });
        } else {
            // Create new patient record
            const newPatient = new Patient({
                patientname,
                attendername,
                patientage,
                bloodgroup,
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
            }); 

            // Save the new patient record in the database
            await newPatient.save();

            // Send success response
            return res.status(201).json({ message: 'Patient registered successfully.' });
        }
    } catch (err) {
        console.error(err);
        // Send a 500 status for any internal server error
        return res.status(500).json({ message: 'An error occurred during registration.' });
    }
};

// -------PatientRegistration End-------PatientRegistration End-------PatientRegistration End-------PatientRegistration End--------

// -------CenterRegistration End-------CenterRegistration End-------CenterRegistration End-------CenterRegistration End--------

// get center registration page
exports.getCenterRegister = (req, res) => {
    return res.render('centerregistration');
};

// post center registration data
exports.postCenterRegister = async (req, res) => {
    try {
        const exists = await Center.findOne({ email: req.body.email });
        const filePaths = req.files.map(file => `uploads\\${file.originalname}`);
        console.log(req.body);

        if (exists) {
            return res.status(400).json({ error: 'A center with this email already exists.' });
        }

        const newCenter = new Center({
            centerName: req.body.centerName,
            registrationNo: req.body.registrationNo,
            address: req.body.address,
            contactNo: req.body.contactNo,
            email: req.body.email,
            websiteURL: req.body.websiteURL,
            servicesOffered: req.body.servicesOffered,
            programsAvailable: req.body.programsAvailable,
            addictions: req.body.addictions,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            emergencyServices: req.body.emergencyServices,
            description: req.body.description,
            geolocation: {
                latitude: req.body.latitude,
                longitude: req.body.longitude
            },
            priceRange: req.body.priceRange,  // Ensure this line is included
            centerImages: filePaths,
        });

        await newCenter.save();
        return res.status(201).json({ message: 'Registered successfully' });
    } catch (error) {
        console.error('Error saving data to MongoDB', error);
        if (!res.headersSent) {
            return res.status(500).send('An error occurred while registering your details. Please try again.');
        }
    }
};


// -------CenterRegistration End-------CenterRegistration End-------CenterRegistration End-------CenterRegistration End--------