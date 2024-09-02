const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const centerRoutes = require('./routes/center');
const indexRoutes = require('./routes/index');
const userpauth = require('./routes/userPAuth');
const patientRoutes = require('./routes/patientreg')
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');

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
  saveUninitialized: false
}));
// Middleware setup
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.use(passport.initialize());
app.use(passport.session());

// Ensure passport.js is required to set up strategies
require('./config/passport');
// Register routes
app.use(centerRoutes);
app.use(indexRoutes);
app.use(userpauth);
app.use(patientRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
