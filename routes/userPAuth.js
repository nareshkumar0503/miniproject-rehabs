const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/UserSchema');
// const bcrypt = require('bcryptjs');
const Patient = require('../models/patientSchema');

// Middleware to check if user is authenticated
async function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId).lean();
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
router.get('/login', (req,res)=>{
    res.render('login');
});

router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Patient.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // const isPasswordValid = await bcrypt.compare(password, user.password);
      // if (!isPasswordValid) {
      //   return res.status(400).json({ message: 'Invalid credentials' });
      // }
      if(password != user.password){
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login error' });
        }
        req.session.userId = user._id;
        req.session.email = user.email;
        req.session.username = user.username;
        res.redirect('/');
      });
    } catch (err) {
      res.status(500).json({ message:  'Server error' });
    }
  });
// Google OAuth routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async(req, res) => {
    try {
        Object.assign(req.session, {
            userId: req.user._id,
            email: req.user.email,
            username: req.user.username
        });
        // Check if the email is in the patient schema
        const patient = await Patient.findOne({ email: req.user.email });
        if (patient) {
            // Redirect to home if patient exists
            res.redirect('/');
        } else {
            // Redirect to patient registration if patient does not exist
            res.render('patientreg', {
                email: req.user.email,
                username: req.user.username
              });
        }
    } catch (error) {
        res.redirect('/login'); // Redirect to login on error
    }
  }
);

router.get('/signup', (req,res)=>{
    res.render('centerregistration');
})

// Profile route
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
      const user = res.locals.user;
      res.render('profile', { user });
  } catch (err) {
      res.status(500).json({ message: 'Server error' });
  } 
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Failed to log out' });
        }
        res.set('Cache-Control', 'no-store');
        res.redirect('/');
    });
});

module.exports = router;