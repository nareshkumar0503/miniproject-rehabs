const express = require('express');
const router = express.Router();
const indexCtrl = require('../controllers/indexCotroller');

//*****Pateint-Attender*****Pateint-Attender*****Pateint-Attender*****Pateint-Attender***** */
router.get('/', indexCtrl.getLandingPage);
router.get('/descPage', indexCtrl.getDescPage);
router.post('/book/appointment', indexCtrl.postAppointment);
router.get('/view/appointment', indexCtrl.getAppointment);
router.post('/cancel/appointment', indexCtrl.cancelAppointment);
router.get('/patient/events', indexCtrl.getPEventPage);
router.post('/book/:eventId/event', indexCtrl.postBookEvent);
router.delete('/cancel/:eventId/event', indexCtrl.deleteBookEvent);
router.get('/patient/guidance', indexCtrl.getGuidancePage);
router.post('/save/patient/addiction', indexCtrl.saveAddiction);
router.get('/score', indexCtrl.getScorePage);
// ---------------------------------------------------------------------------------------------------------

// *****Center *****Center *****Center *****Center *****Center *****Center *****Center ***** */
router.get('/center-dashboard', indexCtrl.getCenterDashboard);
router.post('/appointments/approve/:id', indexCtrl.postAppoinmentTime);
router.post('/appointments/cancel/:id', indexCtrl.postCancelAppointment);
router.post('/add-events', indexCtrl.postEvent);
router.get('/center-view-appointment/:email', indexCtrl.getAppointments);

// ------------------------------------------------------------------------------------------------------------

//events
router.get('/events-my-events', async(req,res)=>{
  res.render('events');
})


module.exports = router;
