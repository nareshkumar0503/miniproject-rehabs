const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');

// Routes
// const centerRoutes = require('./routes/center');
const indexRoutes = require('./routes/index');
const userpauth = require('./routes/userPAuth');
// const patientRoutes = require('./routes/patientreg')
const registerRoutes = require('./routes/registrationRoutes');

//Appointement 
const Appointment = require('./models/appointmentSchema')
// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'public')));

// Connect to MongoDB
mongoose.connect(process.env.MongoUrl)
.then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Could not connect to MongoDB', err);
});

// Session middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure:false, maxAge: 7 * 24 * 60 * 60 * 1000 },
}));
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
// Middleware setup
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.use(passport.initialize());
app.use(passport.session());
// Middleware to run deleteOutdatedAppointments on every request
app.use((req, res, next) => {
  deleteOutdatedAppointments();
  next(); // Continue to the next middleware or route handler
});

// Ensure passport.js is required to set up strategies
require('./config/passport');
// Register routes
// app.use(centerRoutes);
app.use(indexRoutes);
app.use(userpauth);
// app.use(patientRoutes);
app.use(registerRoutes);


// Function to delete outdated appointments
async function deleteOutdatedAppointments() {
  try {
    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];
    // Find and delete appointments where appointmentDate is less than the current date
    const result = await Appointment.deleteMany({ appointmentDate: { $lt: currentDate } });
  } catch (error) {
    console.error('Error deleting outdated appointments:', error);
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
