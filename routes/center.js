const express = require('express');
const Center = require('../models/Center');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/centerregister', upload.array('centerImages', 10), async (req, res) => {
  try {
    const exists = await Center.findOne({ email: req.body.email });
    const filePaths = req.files.map(file => `uploads\\${file.originalname}`);

    if (exists) {
      return res.redirect('/');
    }

    const newCenter = new Center({
      centerName: req.body.centerName,
      registrationNo: req.body.registrationNo,
      address: req.body.address,
      contactNo: req.body.contactNo,
      email: req.body.email,
      websiteURL: req.body.websiteURL,
      servicesOffered: req.body.servicesOffered,
      programsAvailable: req.body.programsAvailable,
      addictions: req.body.addictions,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      emergencyServices: req.body.emergencyServices,
      description: req.body.description,
      geolocation: {
        latitude: req.body.latitude,
        longitude: req.body.longitude
      },
      priceRange: req.body.priceRange,  // Ensure this line is included
      centerImages: filePaths,
    });

    await newCenter.save();
    return res.redirect('/thankyou.html');
  } catch (error) {
    console.error('Error saving data to MongoDB', error);
    if (!res.headersSent) {
      return res.status(500).send('An error occurred while registering your details. Please try again.');
    }
  }
});

module.exports = router;
