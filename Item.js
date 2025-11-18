// models/Item.js
const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Tools', 'Sports', 'Books', 'Appliances', 'Vehicles', 'Others']
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/400x300?text=No+Image'
  },
  rentPerHour: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  ownerContact: {
    type: String
  },
  available: {
    type: Boolean,
    default: true
  },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Good', 'Fair'],
    default: 'Good'
  },
  depositAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
ItemSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Item', ItemSchema);
