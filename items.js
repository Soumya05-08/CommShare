// routes/items.js
const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Profile = require('../models/Profile');
const protect = require('../middleware/authMid');

// GET /api/items - Get all items or search by location and keyword
router.get('/', async (req, res) => {
  try {
    const { search, lat, lng, radius = 50 } = req.query; // radius in km, default 50km

    let query = { available: true };

    // Location-based search
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusInMeters = parseFloat(radius) * 1000;

      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radiusInMeters
        }
      };
    }

    // Keyword search
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const items = await Item.find(query).populate('owner', 'username email').limit(50);
    res.json(items);
  } catch (err) {
    console.error('Get items error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/items/:id - Get single item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'username email');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (err) {
    console.error('Get item error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/items - Create new item (protected)
router.post('/', protect, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      imageUrl,
      rentPerHour,
      address,
      city,
      latitude,
      longitude,
      ownerContact,
      condition,
      depositAmount
    } = req.body;

    // Validation
    if (!name || !description || !category || !rentPerHour || !address || !city || !latitude || !longitude) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const item = new Item({
      name,
      description,
      category,
      imageUrl: imageUrl || 'https://via.placeholder.com/400x300?text=No+Image',
      rentPerHour,
      location: {
        address,
        city,
        coordinates: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        }
      },
      owner: req.user._id,
      ownerName: req.user.username,
      ownerContact: ownerContact || req.user.email,
      condition: condition || 'Good',
      depositAmount: depositAmount || 0
    });

    await item.save();

    // Update user profile to add to recentlyLended
    await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { $push: { recentlyLended: item.name } },
      { upsert: true }
    );

    res.status(201).json({ message: 'Item created successfully', item });
  } catch (err) {
    console.error('Create item error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/items/:id/rent - Rent an item (protected)
router.post('/:id/rent', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (!item.available) {
      return res.status(400).json({ message: 'Item is not available' });
    }

    // Don't allow owner to rent their own item
    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot rent your own item' });
    }

    // Update user profile to add to recentlyBorrowed
    await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { $push: { recentlyBorrowed: item.name } },
      { upsert: true }
    );

    res.json({ message: 'Item rented successfully', item });
  } catch (err) {
    console.error('Rent item error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/items/:id - Update item (protected)
router.put('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is the owner
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const updates = req.body;
    if (updates.latitude && updates.longitude) {
      updates.location = {
        ...item.location,
        coordinates: {
          type: 'Point',
          coordinates: [parseFloat(updates.longitude), parseFloat(updates.latitude)]
        }
      };
      delete updates.latitude;
      delete updates.longitude;
    }

    Object.assign(item, updates);
    await item.save();

    res.json({ message: 'Item updated successfully', item });
  } catch (err) {
    console.error('Update item error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/items/:id - Delete item (protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is the owner
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await item.deleteOne();
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Delete item error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
