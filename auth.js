  // routes/auth.js
  const express = require('express');
  const router = express.Router();
  const User = require('../models/User');
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const { sendOTPEmail } = require('../utils/sendEmail');

  const OTP_EXPIRE_MIN = Number(process.env.OTP_EXPIRE_MIN || 10);

  // routes/auth.js -> signup route (improved)
  router.post('/signup', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) return res.status(400).json({ message: 'All fields required' });

      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already registered' });

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      // generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + OTP_EXPIRE_MIN * 60 * 1000);

      const user = new User({
        username,
        email,
        password: hashed,
        otp,
        otpExpires,
        isVerified: false
      });

      await user.save();

      // Try sending email but don't fail the whole request if it errors.
      let emailSent = false;
      try {
        await sendOTPEmail(email, otp);
        emailSent = true;
      } catch (emailErr) {
        console.error('OTP email send failed:', emailErr);
        // don't throw — we will respond success but tell frontend that email failed
      }

      // Respond success (frontend will redirect to otp page)
      return res.status(201).json({
        message: 'User created. OTP ' + (emailSent ? 'sent to email' : 'generated (email failed).'),
        email,
        emailSent
      });

    } catch (err) {
      console.error('Signup server error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });


  // Verify OTP
  router.post('/verify-otp', async (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'User not found' });

      if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

      if (!user.otp || !user.otpExpires) return res.status(400).json({ message: 'OTP not generated' });

      if (new Date() > user.otpExpires) return res.status(400).json({ message: 'OTP expired' });

      if (otp !== user.otp) return res.status(400).json({ message: 'Invalid OTP' });

      user.isVerified = true;
      user.otp = undefined;
      user.otpExpires = undefined;
      console.log(`✅ New signup: ${email}, OTP: ${otp}`);

      await user.save();

      res.json({ message: 'Email verified successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // inside routes/auth.js (replace existing /resend-otp handler)
  router.post('/resend-otp', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: 'Email required' });

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'User not found' });
      if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + OTP_EXPIRE_MIN * 60 * 1000);
      await user.save();

      // Try sending email but don't fail the whole route if email sending fails.
      let emailSent = false;
      try {
        await sendOTPEmail(email, otp);
        emailSent = true;
      } catch (emailErr) {
        console.error('Resend OTP send failed:', emailErr);
        // continue — we'll respond with a helpful message
      }

      const response = {
        message: emailSent ? 'OTP resent' : 'OTP generated but email failed to send',
        emailSent
      };

      // Development helper: include OTP in response only in dev
      if (process.env.NODE_ENV !== 'production') {
        response.devOtp = otp;
      }

      return res.json(response);
    } catch (err) {
      console.error('Resend OTP server error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });


  // Login -> return JWT
  router.post('/login', async (req, res) => {
    try {
      const { emailOrUsername, password } = req.body;
      if (!emailOrUsername || !password) return res.status(400).json({ message: 'All fields required' });

      const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });

      if (!user.isVerified) return res.status(401).json({ message: 'Email not verified' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

      res.json({ message: 'Login success', token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  module.exports = router;
