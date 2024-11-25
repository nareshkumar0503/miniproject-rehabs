# DeAddiction Project

This project is a rehabilitation and addiction support platform built with Node.js, Express, MongoDB, and EJS. It provides features for users to register, book appointments, find nearby rehabilitation centers, and get support in the early stages of addiction recovery.

## Features

- User registration and login with email verification
- Appointment booking with time slot selection
- Nearby rehabilitation center search
- Multi-step forms for patient registration
- Secure password management and session handling
- Responsive and user-friendly UI

## Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (MongoDB Atlas or local instance)

## Installation

1. Clone the repository:
   
2. Open the folder in VSCode IDE
3. Install the dependencies:
npm install express body-parser bcryptjs path multer dotenv nodemon passport express-session nodemailer mongoose
Setup
1. Create a .env file in the root directory with the following environment variables:
clientID=<Your ClientID provided by google>
clientSecret=<provided by google>
callbackURL=<call back url>
MongoUrl=<mongoDb Url>
EMAIL=<email address>
PASS=<Password>
2. Make sure MongoDB is running and accessible. If using MongoDB Atlas, ensure your IP is whitelisted.

## Running the Application

To start the server, you can use either of the following commands:
Using npm: ```bash
npm start
Using node:
node app.js

## Project Structure

miniproject-rehap/
├── config/
│   └── passport.js   	       		# Google SignOn
├── controllers/
│   ├── indexController.js    		# User-related logic
│   ├── profileController.js     		# Authentication logic
│   └── registrationController.js		# Exercise-related logic
├── models/
│   ├── User.js              # User model
│   ├── Exercise.js          # Exercise model
│   └── Session.js           # Session model for therapy tracking
│   └── ....          		   # Other model
├── routes/
│   ├── userRoutes.js        # Routes for user management
│   ├── authRoutes.js        # Routes for authentication
│   └── exerciseRoutes.js    # Routes for exercises
├── public/
│   ├── css/                 # Stylesheets
│   │   └── style.css
│   ├── js/                  # Client-side scripts
│   │   └── main.js
│   ├── img/                 # Images used in the project
│   └── uploads/             # Uploaded files (e.g., patient documents)
├── views/
│   ├── layouts/             # Layout templates
│   │   └── main.ejs
│   ├── auth/                # Authentication views (login, signup)
│   │   ├── login.ejs
│   │   └── signup.ejs
│   ├── exercises/           # Exercise-related views
│   │   ├── createExercise.ejs
│   │   └── viewExercises.ejs
│   └── users/               # User profile and management views
│       ├── dashboard.ejs
│       └── profile.ejs
├── app.js                   # Main server file
├── package.json             # Dependencies and scripts
└── package-lock.json


## Technologies Used

Node.js - Server-side JavaScript runtime
Express.js - Web application framework for Node.js
MongoDB - NoSQL database (with Mongoose ODM)
EJS - Templating engine for generating HTML pages
Passport.js - User authentication and session management
Nodemailer - Email notifications
Multer - File upload middleware for Node.js
Bcrypt.js - Password hashing for security
