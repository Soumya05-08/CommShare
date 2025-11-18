// routes/profiles.js
const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const User = require('../models/User'); // used for fallback if profile missing
const protect = require('../middleware/authMid');

// GET /api/profiles/user  -> fetch logged-in user's profile
router.get('/user', protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    let profile = await Profile.findOne({ userId });

    // If no profile, try to create from User data (signup might not have created it)
    if (!profile) {
      const user = await User.findById(userId).select('username email');
      if (user) {
        try {
          profile = new Profile({
            userId,
            name: user.username || 'Unnamed',
            email: user.email || ''
          });
          await profile.save();
          return res.json(profile);
        } catch (createErr) {
          console.error('Error auto-creating profile:', createErr);
          // continue to return 404 below if creation fails
        }
      }
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/profiles/user -> create or update logged-in user's profile
router.put('/user', protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { name, email, avatarUrl, recentlyBorrowed, recentlyLended } = req.body;

    const update = { updatedAt: Date.now() };
    if (typeof name === 'string') update.name = name;
    if (typeof email === 'string') update.email = email;
    if (typeof avatarUrl === 'string') update.avatarUrl = avatarUrl;
    if (Array.isArray(recentlyBorrowed)) update.recentlyBorrowed = recentlyBorrowed;
    if (Array.isArray(recentlyLended)) update.recentlyLended = recentlyLended;

    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: update, $setOnInsert: { userId } },
      { new: true, upsert: true }
    );

    res.json({ message: 'Profile saved', profile });
  } catch (err) {
    console.error('Save profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
