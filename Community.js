// models/Community.js
const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, trim: true, lowercase: true },
  phone:      { type: String, required: true, trim: true },
  role:       { type: String, required: true, trim: true },
  about:      { type: String, trim: true },
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('Community', communitySchema);
