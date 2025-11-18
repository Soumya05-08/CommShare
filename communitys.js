// routes/communitys.js
const express = require('express');
const router = express.Router();
const Community = require('../models/Community');

function isValidEmail(email) {
  if (!email) return false;
  const s = String(email).trim().toLowerCase();
  return /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(s);
}

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, role, about } = req.body;

    // Basic validation
    if (!name || !email || !phone || !role) {
      return res.status(400).json({ error: 'Please provide name, email, phone and role.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // Save to DB
    const doc = new Community({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role: role.trim(),
      about: about ? about.trim() : ''
    });
    await doc.save();

    return res.status(201).json({ message: 'Application submitted. Thank you!', id: doc._id });
  } catch (err) {
    console.error('Community submit error:', err);
    return res.status(500).json({ error: 'Server error. Try again later.' });
  }
});

module.exports = router;
