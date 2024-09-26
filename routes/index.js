// /routes/index.js
const express = require('express');
const router = express.Router();
const Center = require('../models/Center');
const Patient = require('../models/patientSchema');
const Appointment = require('../models/appointmentSchema');
router.get('/', async(req, res) => {
    // Home route
    try {
      const centers = await Center.find();
      const username = req.session.username;
      res.render('index', { centers , username});
    } catch (err) {
      res.status(500).send('Server Error');
    }
});

router.get('/descPage', async(req, res) => {
  const email = req.query.email || 'No email provided';
  try {
    const userEmail = req.session.email;
    const patient = await Patient.findOne({email:userEmail});
    if(!patient){
      res.redirect('/login');
    }
    const center = await Center.findOne({email});
    res.render('descPage', { center, patient });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.post('/book-appointment', async(req,res) => {
  const { patientName,  patientEmail, patientContactNo,patientAddiction, appointmentDate, appointmentSession, centerEmail } = req.body;
  try {
    const existingAppointment = await Appointment.findOne({ 
      patientEmail: patientEmail, 
      centerEmail: centerEmail 
    });
    console.log('Existing appointment:', existingAppointment);
    if (existingAppointment) {
        // Step 2: If an appointment already exists, send a response to the client
        return res.status(400).json({ message: 'Appointment already exists for this patient and center.' });
    }
    // Step 3: If no appointment exists, create a new appointment
    const newAppointment = new Appointment({
        patientName,
        patientEmail,
        patientAddiction,
        date:appointmentDate,
        appointmentSession,
        patientPhone: patientContactNo,
        centerEmail,
        status: "Not Confirmed"
    });
    // Step 4: Save the new appointment to the database
    await newAppointment.save();
    // Step 5: Respond with a success message
    return res.status(201).json({ message: 'Appointment booked successfully!' });
  }catch{
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

//view Appointment 
router.get('/view-appointment', async(req, res) => {
    const patientEmail = req.session.email;
    const patient = await Appointment.findOne({patientEmail});
    res.render('viewappointment', { patient });
});
module.exports = router;
