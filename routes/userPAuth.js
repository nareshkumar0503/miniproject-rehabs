const express = require('express');
const passport = require('passport');
const router = express.Router();
// const bcrypt = require('bcryptjs');
const Patient = require('../models/patientSchema');
const profileController = require('../controllers/profileController');

// Middleware to check if user is authenticated
async function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    try {
      const user = await Patient.findById(req.session.userId).lean();
      if (user) {
        res.locals.user = user;
        return next();
      }
    } catch (error) {
      console.error('Error finding user:', error);
    }
  }
  res.locals.user = null;
  next();
}

//-------Google OAuth routes-------Google OAuth routes-------Google OAuth routes-------Google OAuth routes-------//
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Check if the email is in the patient schema
      const patient = await Patient.findOne({ email: req.user.email });
      if (patient) {
        Object.assign(req.session, {
          userId: patient._id,
          email: patient.email,
          username: patient.patientname
        });
        // Redirect to home if patient exists
        res.redirect('/');
      } else {
        // Redirect to patient registration if patient does not exist
        res.render('patientreg', {
          email: req.user.email,
        });
      }
    } catch (error) {
      res.redirect('/login'); // Redirect to login on error
    }
  }
);

//--------------------------------------------------------------------------------// 
router.get('/login', profileController.getLoginPage);
router.post('/login', profileController.postLogin);
router.get('/profile', isAuthenticated, profileController.getProfilePage);
router.get('/logout', profileController.Logout);
//--------------------------------------------------------------------------------// 

module.exports = router;