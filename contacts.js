// routes/contacts.js
const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Simple server-side validation helper
function isValidEmail(email) {
  if (!email) return false;
  const s = String(email).trim().toLowerCase();
  // basic regex - fine for most uses
  return /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(s);
}

// POST /api/contacts
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Please provide name, email and message.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // Save to DB
    const contact = new Contact({ name: name.trim(), email: email.trim(), message: message.trim() });
    await contact.save();

    // Optionally: send a confirmation email here (not included)
    return res.status(201).json({ message: 'Message received. Thank you!', contactId: contact._id });
  } catch (err) {
    console.error('Contact submit error:', err);
    return res.status(500).json({ error: 'Server error. Try again later.' });
  }
});

module.exports = router;
