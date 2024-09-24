// /routes/index.js
const express = require('express');
const router = express.Router();
const Center = require('../models/Center');

router.get('/', async(req, res) => {
    // Home route
    try {
      const centers = await Center.find();
      const username = req.session.username;
      res.render('index', { centers , username});
    } catch (err) {
      res.status(500).send('Server Error');
    }
});

router.get('/descPage', async (req, res) => {
  const email = req.query.email || 'No email provided';
  try {
    const userEmail = req.session.email;
    const centerDocument = await Center.findOne({ email });
    const center = centerDocument ? centerDocument.toObject() : null; // Convert to plain JS object
    res.render('descPage', { center, userEmail });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
