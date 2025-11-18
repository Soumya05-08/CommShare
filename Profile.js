// models/Profile.js
const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: 'User'
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatarUrl: { type: String, default: '' },
  recentlyBorrowed: { type: [String], default: [] },
  recentlyLended: { type: [String], default: [] },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Clean JSON output
ProfileSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Profile', ProfileSchema);
