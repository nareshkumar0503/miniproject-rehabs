// /routes/index.js
const express = require('express');
const router = express.Router();
const Center = require('../models/Center');
const Patient = require('../models/patientSchema');
const Appointment = require('../models/appointmentSchema');
const Event = require('../models/eventSchema')
router.get('/', async (req, res) => {
  // Home route
  try {
    const centers = await Center.find();
    const username = req.session.username;
    console.log(username)
    res.render('index', { centers, username });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/descPage', async (req, res) => {
  const email = req.query.email || 'No email provided';
  try {
    const userEmail = req.session.email;
    const patient = await Patient.findOne({ email: userEmail });
    const username = req.session.username
    if (!patient) {
      res.redirect('/login');
    }
    const center = await Center.findOne({ email });
    res.render('descPage', { center, patient, username });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.post('/book-appointment', async (req, res) => {
  const { patientName, patientAge, patientEmail, patientPhone, patientAddiction, appointmentDate, appointmentSession, centerEmail, centerName, attenderPhone, patientBloodGroup } = req.body;
  try {
    // Ensure date is in 'YYYY-MM-DD' format
    const formattedAppointmentDate = appointmentDate.substring(0, 10);
    // Step 1: Check if an appointment already exists with the same email and appointment date for the same center
    const existingAppointment = await Appointment.findOne({
      patientEmail: patientEmail,
      appointmentDate: formattedAppointmentDate, // Correct field name
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
      appointmentDate: formattedAppointmentDate,
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
  } catch (error) {
    console.error('Error booking appointment:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});
// ---------------------------------------------------------------------------------------------------------

//view Appointment 
router.get('/view-appointment', async (req, res) => {
  const patientEmail = req.session.email;
  const appointments = await Appointment.find({ patientEmail });
  res.render('viewappointment', { appointments });
});
//------------------------------------------------------------------------------------------------------------

//center-dashboard
router.get('/center-dashboard', async (req, res) => {
  const email = req.session.email;
  
  try {
    // Find the center by email
    const center = await Center.findOne({ email });
    
    if (!center) {
      return res.redirect('/login');
    }
    
    // Find appointments for the center that are not confirmed
    const appointments = await Appointment.find({
      centerEmail: email,
      status: { $ne: 'Approved' } // Fetch only those that are not 'Approved'
    });

    return res.render('centerdash', { center, appointments});
  } catch (error) {
    console.error('Error fetching data for center dashboard:', error);
    res.status(500).send('Server Error');
  }
});
// ---------------------------------------------------------------------------------------------------------


// Approve appointment logic
router.post('/appointments/approve/:id', async (req, res) => {
  try {
      const appointmentId = req.params.id;
      const time = req.body.time;
      const timeString = String(time);
      // Logic to approve the appointment, e.g., updating the status
      await Appointment.findByIdAndUpdate(appointmentId, { 
        status: 'Approved',
        time : timeString });
        res.status(200); // Redirect back to appointments page
  } catch (error) {
      console.error('Error approving appointment:', error);
      res.status(500).send('Internal Server Error');
  }
});
// -------------------------------------------------------------------------------------------------------------------------

router.post('/appointments/cancel/:id', async (req, res) => {
  const appointmentId = req.params.id;
  try {
    const appointmentId = req.params.id;
    const time = req.body;
    // Logic to approve the appointment, e.g., updating the status
    await Appointment.findByIdAndUpdate(appointmentId, { 
      status: 'Appointment Canceled'
      });
      res.status(200); // Redirect back to appointments page
    } catch (error) {
        console.error('Error approving appointment:', error);
        res.status(500).send('Internal Server Error');
    } 
});
// -------------------------------------------------------------------------------------------------------------------------

//events
router.get('/events-my-events', async(req,res)=>{
  res.render('events');
})
// -------------------------------------------------------------------------------------------------------------------------

//add events
router.post('/add-events', async (req,res)=>{
  
  const {eventName,
    eventDesc,
    eventDate,
    eventTime,
    centerName,
    centerEmail} = req.body;
     // Basic validation to ensure all fields are provided
     if (!eventName || !eventDesc || !eventDate || !eventTime || !centerName || !centerEmail) {
      return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const newEvent = new Event({
      eventName, eventDesc, eventDate, eventTime, centerName, centerEmail
    });
    newEvent.save();
    res.status(201).send('Event added successfully');
  }catch(err){
    console.log('add-events:',err);
    res.status(500).json({message : err})
  }
});
// -------------------------------------------------------------------------------------------------------------------------


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
