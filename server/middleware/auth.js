const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { findUserByIdOrGoogleId, validateUserIdentifier } = require('../utils/userUtils');

// JWT Secret (should be in environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

// Validate JWT Secret in production
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-super-secret-jwt-key-here') {
  throw new Error('Production environment requires a strong JWT_SECRET environment variable');
}

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// Verify JWT Token Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('🔍 Authentication middleware called');
    console.log('🎫 Token received:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Validate token format (basic checks)
    if (token.length < 10) {
      console.log('❌ Invalid token format: too short');
      return res.status(401).json({
        success: false,
        message: 'Invalid token format.'
      });
    }

    console.log('🔍 Verifying JWT token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ JWT decoded successfully:', { userId: decoded.userId });
    
    // Validate user identifier format
    const validation = validateUserIdentifier(decoded.userId);
    if (!validation.valid) {
      console.log('❌ Invalid user identifier in token:', validation.error);
      return res.status(401).json({
        success: false,
        message: 'Invalid token: malformed user identifier.'
      });
    }
    
    // Use unified user lookup
    const user = await findUserByIdOrGoogleId(decoded.userId);
    console.log('🔍 User lookup result:', user ? { id: user._id, email: user.email } : 'USER NOT FOUND');
    
    if (!user) {
      console.log('❌ Invalid token: User not found in database');
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (!user.isActive) {
      console.log('❌ User account is deactivated');
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    console.log('✅ Authentication successful for user:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Authentication middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ JWT Error: Invalid token format');
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    } else if (error.name === 'TokenExpiredError') {
      console.log('❌ JWT Error: Token expired');
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    
    console.error('❌ Unexpected authentication error:', error);
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
