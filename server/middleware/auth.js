const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Secret (should be in environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// Verify JWT Token Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Development mode: Allow mock tokens
    if (token === 'mock-jwt-token-for-development') {
      req.user = {
        _id: 'mock-user-id',
        id: 'mock-user-id',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'developer',
        projects: []
      };
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-googleId -__v');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Authorization middleware for specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-googleId -__v');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check if user owns resource or is admin
const checkOwnership = (resourceUserField = 'user') => {
  return (req, res, next) => {
    const resourceUserId = req.resource?.[resourceUserField]?.toString() || 
                          req.params?.userId || 
                          req.body?.[resourceUserField];
    
    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: 'Resource ownership cannot be determined.'
      });
    }

    if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId.toString()) {
      return next();
    }

    res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.'
    });
  };
};

module.exports = {
  generateToken,
  authenticate,
  authorize,
  optionalAuth,
  checkOwnership,
  JWT_SECRET,
  JWT_EXPIRE
};
