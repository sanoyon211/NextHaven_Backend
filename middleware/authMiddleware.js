const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify custom JWT from HttpOnly cookie
const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token and attach to req (excluding password, though firebase is used)
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
       return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    next();
  } catch (error) {
    console.error(`Token Verification Error: ${error.message}`);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { verifyToken, isAdmin };
