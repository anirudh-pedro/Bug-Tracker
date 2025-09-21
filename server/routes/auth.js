const express = require('express');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  googleAuth,
  getCurrentUser,
  refreshToken
} = require('../controller/authController');

const router = express.Router();

// @desc    Authenticate user with Google
// @route   POST /api/auth/google
// @access  Public
router.post('/google', authLimiter, googleAuth);

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', authenticate, getCurrentUser);

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
router.post('/refresh', authLimiter, authenticate, refreshToken);

module.exports = router;
