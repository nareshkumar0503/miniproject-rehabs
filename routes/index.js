const express = require('express');
const router = express.Router();
const indexCtrl = require('../controllers/indexCotroller');

//*****Pateint-Attender*****Pateint-Attender*****Pateint-Attender*****Pateint-Attender***** */
router.get('/', indexCtrl.getLandingPage);
router.get('/descPage', indexCtrl.getDescPage);
router.post('/book-appointment', indexCtrl.postAppointment);
router.get('/view-appointment', indexCtrl.getAppointment);
router.post('/cancel-appointment', indexCtrl.cancelAppointment);


// ---------------------------------------------------------------------------------------------------------

// *****Center *****Center *****Center *****Center *****Center *****Center *****Center ***** */
router.get('/center-dashboard', indexCtrl.getCenterDashboard);
router.post('/appointments/approve/:id', indexCtrl.postAppoinmentTime);
router.post('/appointments/cancel/:id', indexCtrl.postCancelAppointment);
router.post('/add-events', indexCtrl.postEvent);
router.get('/center-view-appointment/:email', indexCtrl.getAppointments);

// ------------------------------------------------------------------------------------------------------------


// ---------------------------------------------------------------------------------------------------------



// Approve appointment logic
// router.post('/appointments/approve/:id', async (req, res) => {
//   try {
//       const appointmentId = req.params.id;
//       const time = req.body.time;
//       const timeString = String(time);
//       // Logic to approve the appointment, e.g., updating the status
//       await Appointment.findByIdAndUpdate(appointmentId, { 
//         status: 'Approved',
//         time : timeString });
//         res.status(200); // Redirect back to appointments page
//   } catch (error) {
//       console.error('Error approving appointment:', error);
//       res.status(500).send('Internal Server Error');
//   }
// });
// -------------------------------------------------------------------------------------------------------------------------

// router.post('/appointments/cancel/:id', async (req, res) => {
//   try {
//     const appointmentId = req.params.id;
//     const time = req.body;
//     // Logic to approve the appointment, e.g., updating the status
//     await Appointment.findByIdAndUpdate(appointmentId, { 
//       status: 'Appointment Canceled'
//       });
//       res.status(200); // Redirect back to appointments page
//     } catch (error) {
//         console.error('Error approving appointment:', error);
//         res.status(500).send('Internal Server Error');
//     } 
// });
// -------------------------------------------------------------------------------------------------------------------------

//events
router.get('/events-my-events', async(req,res)=>{
  res.render('events');
})


module.exports = router;
