// /routes/index.js
const express = require('express');
const router = express.Router();
const Center = require('../models/Center');

router.get('/', async(req, res) => {
    // Home route
    try {
      const centers = await Center.find();
      const username = req.session.username;
      console.log(username);
      res.render('index', { centers , username});
    } catch (err) {
      res.status(500).send('Server Error');
    }
});

module.exports = router;
