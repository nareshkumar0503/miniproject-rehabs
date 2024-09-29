const Center = require('../models/Center');
const Patient = require('../models/patientSchema');
const Appointment = require('../models/appointmentSchema');
const Event = require('../models/eventSchema');

//*****Pateint-Attender*****Pateint-Attender*****Pateint-Attender*****Pateint-Attender***** */
// ------Landing Page------Landing Page------Landing Page------Landing Page------//
exports.getLandingPage = async (req, res) => {
  try {
    const centers = await Center.find();
    const username = req.session.username;
    res.render('index', { centers, username });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
//****************************************************************************** */

//-------Get Description Page******Get Description Page******Get Description Page******/
exports.getDescPage = async (req, res) => {
  const email = req.query.email || 'No email provided';
  console.log(email)
  try {
    const patientEmail = req.session.email;
    const patient = await Patient.findOne({ email: patientEmail });
    const appointment = await Appointment.findOne({ patientEmail });
    var status = 0;
    if (appointment) {
      status = 1;
    }
    const username = req.session.username
    if (!patient) {
      return res.redirect('/login');
    }
    const center = await Center.findOne({ email });
    return res.render('descPage', { center, patient, username, status });
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
  res.render('viewappointment', { appointments });
};
//****************************************************************************** */

// ********cancel-appointment ********cancel-appointment ********cancel-appointment ******** */
exports.cancelAppointment = async (req, res) => {
  const { centerEmail, appointmentDate} = req.body;
  const patientEmail = req.session.email;
   try {
    // Find and delete the appointment based on the provided centerEmail and appointmentDate
    const result = await Appointment.deleteOne({
        patientEmail,
        centerEmail: centerEmail,
        appointmentDate: appointmentDate
    });

    // Check if the deletion was successful
    if (result.deletedCount > 0) {
        return res.json({ success: true, message: 'Appointment deleted successfully' });
    } else {
       return res.json({ success: false, message: 'No appointment found to delete' });
    }
} catch (error) {
    console.error('Error deleting appointment:', error);
    return res.status(500).json({ success: false, message: 'Server error, could not delete appointment' });
}
};
//*****Pateint-Attender*****Pateint-Attender*****Pateint-Attender*****Pateint-Attender***** */



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
    res.status(500).send('Server Error');
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
    res.status(200).json({ success: true, message: 'Cancelled Successfully' }); // Redirect back to appointments page
  } catch (error) {
    console.error('Error Cancelling appointment:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
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
  res.render('center-view-app', { appointmentsByDate: appointmentsByDateArray });
}

// *************************************************************************************************************//