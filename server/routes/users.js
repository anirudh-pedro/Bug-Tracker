const express = require('express');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Complete user onboarding
// @route   POST /api/users/complete-onboarding
// @access  Private
router.post('/complete-onboarding', authenticate, async (req, res) => {
  try {
    const { phoneNumber, industry } = req.body;

    // Validate phone number
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits'
      });
    }

    // Validate industry
    const validIndustries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Consulting', 'Real Estate', 'Media & Entertainment', 'Non-Profit', 'Government', 'Other'];
    if (!industry || !validIndustries.includes(industry)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid industry'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        phoneNumber,
        industry,
        isFirstTimeUser: false,
        hasCompletedOnboarding: true
      },
      { new: true, runValidators: true }
    ).select('-password -googleId');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: user
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing onboarding'
    });
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin/Manager only)
router.get('/', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('-password -googleId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -googleId');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, avatar },
      { new: true, select: '-password -googleId' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private (Admin only)
router.put('/:id/role', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['admin', 'manager', 'developer', 'tester'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: '-password -googleId' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: `User role updated to ${role}`
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user role'
    });
  }
});

module.exports = router;
