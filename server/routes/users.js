const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  testAuth,
  debugUsers,
  clearAllUsers,
  checkUsernameAvailability,
  completeOnboarding,
  updateProfile
} = require('../controller/userController');

const router = express.Router();

// @desc    Test token authentication
// @route   GET /api/users/test-auth
// @access  Private
router.get('/test-auth', authenticate, testAuth);

// @desc    Debug endpoint to see all users
// @route   GET /api/users/debug
// @access  Private
router.get('/debug', authenticate, debugUsers);

// @desc    Clear all users (for development only)
// @route   DELETE /api/users/clear-all
// @access  Private
router.delete('/clear-all', authenticate, clearAllUsers);

// @desc    Check username availability
// @route   POST /api/users/check-username
// @access  Private
router.post('/check-username', authenticate, checkUsernameAvailability);

// @desc    Complete user onboarding
// @route   POST /api/users/complete-onboarding
// @access  Private
router.post('/complete-onboarding', authenticate, completeOnboarding);

// @desc    Update user profile
// @route   PUT /api/users/update-profile
// @access  Private
router.put('/update-profile', authenticate, updateProfile);

module.exports = router;
