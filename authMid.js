// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  let token = null;
  // token in header Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Token invalid' });
  }
}

module.exports = protect;
