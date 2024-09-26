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
      console.log(username)
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
    const username = req.session.username
    if(!patient){
      res.redirect('/login');
    }
    const center = await Center.findOne({email});
    res.render('descPage', { center, patient, username });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.post('/book-appointment', async(req,res) => {
  const { patientName , patientAge, patientEmail , patientPhone,patientAddiction, appointmentDate, appointmentSession, centerEmail, centerName, attenderPhone, patientBloodGroup} = req.body;
  try {
    console.log('Request Body:', req.body); 
    // Step 1: Check if an appointment already exists with the same email and appointment date for the same center
    const existingAppointment = await Appointment.findOne({
      patientEmail: patientEmail,
      appointmentDate: appointmentDate, // Correct field name
      centerEmail: centerEmail // Ensuring appointment at the same center
  });
    console.log('Existing appointment:', existingAppointment);
    if (existingAppointment) {
        // Step 2: If an appointment already exists, send a response to the client
        return res.status(400).json({ message: 'Appointment already exists for this patient and center.' });
    }
    // Step 3: If no appointment exists, create a new appointment
    const newAppointment = new Appointment({
        patientName,
        patientAge,
        patientEmail,
        patientPhone,
        patientAddiction,
        appointmentDate,
        appointmentSession,
        centerEmail,
        centerName, 
        attenderPhone, 
        patientBloodGroup,
        status: "Not Confirmed"
    });
    // Step 4: Save the new appointment to the database
    await newAppointment.save();
    // Step 5: Respond with a success message
    return res.status(201).json({ message: 'Appointment booked successfully!' });
  }catch(error){
    console.error('Error booking appointment:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

//view Appointment 
router.get('/view-appointment', async(req, res) => {
    const patientEmail = req.session.email;
    const patient = await Appointment.findOne({patientEmail});
    res.render('viewappointment', { patient });
});


//c/center-dashboard
router.get('/center-dashboard' , async (req,res)=>{
  const email = req.session.email;
  const center = await Center.findOne({email});
  if(!center){
    res.redirect('/login');
  }
  return res.render('centerdashboard', {center});
});

//schedule appointment
// Schedule or update appointment
router.put('/schedule-appointment', async (req, res) => {
  try {
      const { patientemail, time } = req.body;

      // Find the appointment by patient's email
      const appointment = await Appointment.findOne({ patientemail });

      if (!appointment) {
          return res.status(404).json({ message: 'Appointment not found.' });
      }

      // Update the time and status to 'confirmed'
      appointment.time = time; // Add the time
      appointment.status = 'confirmed'; // Update status

      // Save the updated appointment back to the database
      await appointment.save();

      return res.status(200).json({ message: 'Appointment confirmed successfully.', appointment });
  } catch (err) {
      console.log(err);
      return res.status(500).json({ message: 'An error occurred while scheduling the appointment.' });
  }
});

// Function to delete outdated appointments
async function deleteOutdatedAppointments() {
  try {
      // Get the current date in YYYY-MM-DD format
      const currentDate = new Date().toISOString().split('T')[0];

      // Find and delete appointments where appointmentDate is less than the current date
      const result = await Appointment.deleteMany({ appointmentDate: { $lt: currentDate } });
      
      console.log(`${result.deletedCount} outdated appointments deleted.`);
  } catch (error) {
      console.error('Error deleting outdated appointments:', error);
  }
}

// Call the function to clean up outdated appointments on server start
deleteOutdatedAppointments();

// Schedule the function to run at 12:00 AM every day
const msInADay = 24 * 60 * 60 * 1000; // 1 day in milliseconds

setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) { // Check if it's exactly 12:00 AM
      deleteOutdatedAppointments();
  }
}, 60 * 1000); // Check every minute if it's 12:00 AM

module.exports = router;
