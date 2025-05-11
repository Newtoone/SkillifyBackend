const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('➡️ Incoming request headers:', req.headers);
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    console.log('🔑 Token found, verifying...');
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified, decoding user ID:', decoded.id);
    
    // Find user by id
    const user = await User.findById(decoded.id);
    
    if (!user) {
      console.log('❌ No user found with that token');
      return res.status(401).json({ message: 'Token is invalid' });
    }
    
    // Attach user to request
    req.user = user;
    console.log('✅ User attached:', user.username);
    next();
  } catch (error) {
    console.error('⚠️ Auth error:', error.message);
    res.status(401).json({ message: 'Invalid token, authorization denied' });
  }
};

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

module.exports = { auth, admin };