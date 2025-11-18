// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },              // store OTP (hashed or plain — we'll use plain limited-time for simplicity)
  otpExpires: { type: Date },         // expiry time
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
