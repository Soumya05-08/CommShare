// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// routes
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const communityRoutes = require('./routes/communitys');
const profilesRoutes = require('./routes/profiles');
const itemRoutes = require('./routes/items');


const protect = require('./middleware/authMid');

const app = express();

// --- Security & CORS ---
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || true,
  credentials: true
}));

// --- Static files ---
app.use(express.static(path.resolve()));

// --- Body parsers ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Connect DB early ---
connectDB();

// --- Simple request logger ---
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl} - from ${req.headers.origin || req.ip} - content-type: ${req.headers['content-type']}`);
  next();
});

// --- API routes ---
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/items', itemRoutes);


// --- Example protected endpoint ---
app.get('/api/profile', protect, (req, res) => {
  res.json({ user: req.user });
});

// --- 404 handler ---
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  res.status(404).sendFile(path.join(__dirname, '404.html'), err => {
    if (err) res.status(404).send('Page not found');
  });
});

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Server error'
  });
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
