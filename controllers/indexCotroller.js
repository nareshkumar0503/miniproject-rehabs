const Center = require('../models/Center');
const Patient = require('../models/patientSchema');
const Appointment = require('../models/appointmentSchema');
const Event = require('../models/eventSchema');
const BookedEvent = require('../models/bookedEventSchema')

//*****Pateint-Attender*****Pateint-Attender*****Pateint-Attender*****Pateint-Attender***** */
// ------Landing Page------Landing Page------Landing Page------Landing Page------//
exports.getLandingPage = async (req, res) => {
  try {
    const centers = await Center.find();
    const username = req.session.username;
    return res.render('index', { centers, username });
  } catch (err) {
    return res.status(500).send('Server Error');
  }
};
//****************************************************************************** */

//-------Get Description Page******Get Description Page******Get Description Page******/
exports.getDescPage = async (req, res) => {
  const email = req.query.email || 'No email provided';
  try {
    const patientEmail = req.session.email;
    const patient = await Patient.findOne({ email: patientEmail });
    if (!patient) {
      // Store the original URL the user wanted to visit
      req.session.redirectTo = req.originalUrl;
      return res.redirect('/login');
    }
    const username = req.session.username;
    const appointment = await Appointment.findOne({ patientEmail: patient.email });
    var status = 0;
    if (appointment) {
      status = 1;
    }
    const center = await Center.findOne({ email });
    return res.render('descPage', { center, username, patient, status });
  } catch (err) {
    return res.status(500).send('Server Error');
  }
};
//****************************************************************************** */

//******Book-Appointment******Book Appointment******Book Appointment************Book Appointment******Book Appointment******Book Appointment******Book Appointment******Book Appointment******Book Appointment****** */
exports.postAppointment = async (req, res) => {
  const { patientName, patientAge, patientEmail, patientPhone, patientAddiction, appointmentDate, appointmentSession, centerEmail, centerName, attenderPhone, patientBloodGroup } = req.body;
  try {
    // Ensure date is in 'YYYY-MM-DD' format
    const formattedAppointmentDate = appointmentDate.substring(0, 10);
    // Step 1: Check if an appointment already exists with the same email and appointment date for the same center
    const existingAppointment = await Appointment.findOne({
      patientEmail: patientEmail,
      appointmentDate: formattedAppointmentDate, // Correct field name
    });

    console.log('Existing appointment:', existingAppointment);
    if (existingAppointment) {
      // Step 2: If an appointment already exists, send a response to the client
      return res.status(400).json({ success: false, message: 'Appointment already exists.' });
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
    return res.status(201).json({ success: true, message: 'Appointment booked successfully!' });
  } catch (error) {
    console.error('Error booking appointment:', error);
    return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};
//****************************************************************************************************************************************************************************************************************** */

//******view-Appointment******view-Appointment******view-Appointment******view-Appointment*/
exports.getAppointment = async (req, res) => {
  const patientEmail = req.session.email;
  if(!patientEmail){
    req.session.redirectTo = req.originalUrl;
    return res.redirect('/login');
  }
  const appointments = await Appointment.find({ patientEmail });
  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    let hours12 = (hours % 12) || 12;
    const period = hours < 12 ? 'AM' : 'PM';
    return `${hours12}:${minutes} ${period}`;
  };

  appointments.forEach(appointment => {
    if (appointment.time) {
      appointment.formattedTime = formatTime(appointment.time);
    }
  });
  return res.render('viewappointment', { appointments });
};
//****************************************************************************** */

// ********cancel-appointment ********cancel-appointment ********cancel-appointment ******** */
exports.cancelAppointment = async (req, res) => {
  const { centerEmail } = req.body;
  const patientEmail = req.session.email;
  try {
    // Find and delete the appointment based on the provided centerEmail and appointmentDate
    const result = await Appointment.deleteOne({
      patientEmail,
      centerEmail: centerEmail,
    });
    console.log(result);
    // Check if the deletion was successful
    if (result.deletedCount > 0) {
      return res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
    } else {
      return res.status(404).json({ success: false, message: 'No appointment found to delete' });
    }
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return res.status(500).json({ success: false, message: 'Server error, could not delete appointment' });
  }
};

// ******Event ******Event ******Event ******Event ******Event ******Event ******Event ******Event ****** */
exports.getPEventPage = async (req, res) => {
  try {
    const patientEmail = req.session.email;
    const username = req.session.username;

    if (!patientEmail) {
      // Store the original URL the user wanted to visit
      req.session.redirectTo = req.originalUrl;
      return res.redirect('/login');
    }

    // Find all events the patient has booked
    const bookedEvents = await BookedEvent.find({ patientEmail }).populate('eventId');
    const allEvents = await Event.find();

    // Prepare the data for booked events (myEvents)
    const myEvents = bookedEvents.map(bookedEvent => {
      const event = bookedEvent.eventId; // Refer to the event document
      return {
        id: bookedEvent._id,
        name: event.eventName,
        date: event.eventDate,
        time: event.eventTime,
        bookedOn: bookedEvent.timestamp, // The time when the event was booked
        host: event.centerName,
        description: event.eventDesc
      };
    });

    // Filter out events that are already booked
    const bookedEventIds = bookedEvents.map(bookedEvent => bookedEvent.eventId._id.toString());
    const availableEvents = allEvents.filter(event => !bookedEventIds.includes(event._id.toString()));

    // Render the EJS view with myEvents and availableEvents
    return res.render('events', { myEvents, availableEvents, username });

  } catch (err) {
    console.error('Error fetching events:', err);
    return res.status(500).send('Internal Server Error');
  }
};

// ******************************************************************************************************* */

// ******book-event ******book-event ******book-event ******book-event ******book-event ******book-event * */
exports.postBookEvent = async (req, res) => {
  try {
    const patientEmail = req.session.email;
    const eventId = req.params.eventId;
    const exists = await BookedEvent.findOne({ patientEmail, eventId });
    if (exists) {
      return res.status(409).json({ success: false, message: 'You have already booked' });
    }
    // Create a new booked event document
    const newEvent = new BookedEvent({
      patientEmail,
      eventId
    });
    await newEvent.save();
    return res.status(200).json({ success: true, message: 'Event Booked Successfully' })
  } catch (err) {
    console.error('Error booking event:', err);
    return res.status(500);
  }
}
// ******************************************************************************************************* */

// *******Delete-Book-Event *******Delete-Book-Event *******Delete-Book-Event *******Delete-Book-Event**** */
exports.deleteBookEvent = async (req, res) => {
  const eventId = req.params.eventId;
  try{
    const deleted = await BookedEvent.findByIdAndDelete(eventId);
    if(deleted){
      return res.status(200).json({ success: true, message: 'Event deleted successfully'});
    }else{
      return res.status(404).json({ success: false, message: 'Event not found'});
    }
  }catch(err){
    console.error('Error deleting event:', err);
    return res.status(500);
  }
}

// *****Guidance *****Guidance *****Guidance *****Guidance *****Guidance *****Guidance *****Guidance ***** */
exports.getGuidancePage = (req,res)=>{
  const score = parseInt(req.query.score) || 0;
  return res.render('guidance',{score});
}

exports.getScorePage = (req,res) => {
  return res.render('score');
}
//*****Pateint-Attender-End*****Pateint-Attender-End*****Pateint-Attender-End*****Pateint-Attender-End***** */



// ******Center-DashBoard ******Center-DashBoard ******Center-DashBoard ******Center-DashBoard*********//
exports.getCenterDashboard = async (req, res) => {
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
      status: 'Not Confirmed' // Fetch only those with status 'Not Confirmed'
    });

    return res.render('centerdash', { center, appointments });
  } catch (error) {
    console.error('Error fetching data for center dashboard:', error);
    return res.status(500).send('Server Error');
  }
}
// ********************************************************************************************//

// 
exports.postAppoinmentTime = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const time = req.body.time;
    const timeString = String(time);
    // Logic to approve the appointment, e.g., updating the status
    await Appointment.findByIdAndUpdate(appointmentId, {
      status: 'Approved',
      time: timeString
    });
    return res.status(200).json({ success: true, message: 'Schedualed Successfully' }); // Redirect back to appointments page
  } catch (error) {
    console.error('Error scheduling appointment:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
// ********************************************************************************************//

// ******Center-Cancel-Appointment ******Center-Cancel-Appointment ******Center-Cancel-Appointment******//
exports.postCancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    // Logic to approve the appointment, e.g., updating the status
    await Appointment.findByIdAndUpdate(appointmentId, {
      time: '-',
      status: 'Cancelled'
    });
    return res.status(200).json({ success: true, message: 'Cancelled Successfully' }); // Redirect back to appointments page
  } catch (error) {
    console.error('Error Cancelling appointment:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
// ********************************************************************************************//

// ******Event ******Event ******Event ******Event ******Event ******Event ******Event ******// 
exports.postEvent = async (req, res) => {
  const { eventName,
    eventDesc,
    eventDateType,
    eventTime,
    centerName,
    centerEmail } = req.body;
  const eventDate = eventDateType.substring(0, 10);
  // Basic validation to ensure all fields are provided
  if (!eventName || !eventDesc || !eventDateType || !eventTime || !centerName || !centerEmail) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  try {
    const newEvent = new Event({
      eventName, eventDesc, eventDate, eventTime, centerName, centerEmail
    });
    newEvent.save();
    return res.status(201).json({ success: true, message: 'Event added successfully' });
  } catch (err) {
    console.log('add-events:', err);
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
// *************************************************************************************************************//

// ******Get-Appointments ******Get-Appointments ******Get-Appointments ******Get-Appointments ****** ******Get-Appointments//
exports.getAppointments = async (req, res) => {
  const email = req.params.email;
  const appointments = await Appointment.find({ centerEmail: email, status: 'Approved' }).sort('appointmentDate');

  // Group appointments by date
  const appointmentsByDate = appointments.reduce((acc, appointment) => {
    const date = appointment.appointmentDate || 'No Date';

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push(appointment);
    return acc;
  }, {});

  // Convert object to an array of date-grouped appointments
  const appointmentsByDateArray = Object.keys(appointmentsByDate).map(date => {
    return {
      date,
      appointments: appointmentsByDate[date]
    };
  });
 return res.render('center-view-app', { appointmentsByDate: appointmentsByDateArray });
}

// *************************************************************************************************************//

