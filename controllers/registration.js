const Patient = require('../models/patientSchema');
const Center = require('../models/Center');
const nodemailer = require('nodemailer');


// ******Configure nodemailer ******Configure nodemailer ******Configure nodemailer ******Configure nodemailer***** /
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '23mx315@psgtech.ac.in',
        pass: process.env.EMAIL_PASS
    }
});
// ------patient registration------patient registration------patient registration------patient registration------patient registration-------

// get patient register page
exports.getPatientRegister = (req, res) => {
    const email = '';
    res.render('patientreg', { email });
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

            // Sending Mail
            // Sending Mail
            const mailOptions = {
                from: '23mx315@psgtech.ac.in',
                to: email,
                subject: 'Welcome to DEADDICTION - Successful Registration',
                html: `
    <p>Dear ${patientname},</p>
    <p>Thank you for registering with <strong>DEADDICTION</strong>. Your account has been successfully created, and you now have access to our rehab center portal.</p>
    
    <h3>Your Journey Begins:</h3>
    <p>At <strong>DEADDICTION</strong>, we are committed to helping you overcome addiction and regain control of your life. You can now explore various rehabilitation centers, schedule appointments, and access resources tailored to your recovery needs.</p>

    <h3>Next Steps:</h3>
    <ol>
        <li><strong>Explore Centers:</strong> Browse through our list of rehab centers, check their services, and choose one that fits your needs.</li>
        <li><strong>Book Appointments:</strong> Easily schedule appointments with centers for consultations and recovery sessions.</li>
        <li><strong>Get Guidance:</strong> Access our comprehensive guidance section to receive personalized tips based on your progress.</li>
    </ol>

    <p>We are here to support you every step of the way. You can log in to your account at any time by visiting <a href="https://your-website-url.com" style="color:rgb(0, 115, 255);">our portal</a>.</p>
    
    <p>If you have any questions or need further assistance, feel free to reach out to us at <a href="mailto:${process.env.EMAIL_USER}" style="color:rgb(0, 115, 255);">${process.env.EMAIL_USER}</a>.</p>
    
    <img src="https://i.imgur.com/lrlPoGi.png" alt="DEADDICTION" style="width: 280px;">
    <br>
    <p><strong>Best regards,</strong><br>
       DEADDICTION Support Team</p>
    `
            };
            transporter.sendMail(mailOptions);
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