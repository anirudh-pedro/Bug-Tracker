const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  testAuth,
  debugUsers,
  clearAllUsers,
  checkUsernameAvailability,
  completeOnboarding,
  updateProfile,
  getProfileStatus
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

// @desc    Debug endpoint to see all users (public for testing)
// @route   GET /api/users/debug-public
// @access  Public
router.get('/debug-public', async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find({}).select('email username googleId createdAt hasCompletedOnboarding');
    res.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        username: user.username || 'NO_USERNAME',
        hasUsername: !!user.username,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Debug public endpoint error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

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

// @desc    Get user profile status
// @route   GET /api/users/profile-status
// @access  Private
router.get('/profile-status', authenticate, getProfileStatus);

module.exports = router;
