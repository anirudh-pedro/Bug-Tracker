const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// @desc    Test token authentication
// @route   GET /api/users/test-auth
// @access  Private
const testAuth = async (req, res) => {
  try {
    console.log('🔍 Test auth endpoint hit');
    console.log('👤 Authenticated user:', {
      id: req.user.id,
      email: req.user.email,
      username: req.user.username
    });
    
    res.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: req.user.id,
        email: req.user.email,
        username: req.user.username
      }
    });
  } catch (error) {
    console.error('Test auth error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Debug endpoint to see all users
// @route   GET /api/users/debug
// @access  Private
const debugUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('email username googleId createdAt updatedAt');
    res.json({
      success: true,
      count: users.length,
      users: users,
      currentUser: {
        id: req.user.id,
        email: req.user.email,
        username: req.user.username
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Clear all users (for development only)
// @route   DELETE /api/users/clear-all
// @access  Private
const clearAllUsers = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ 
        success: false, 
        message: 'This endpoint is only available in development mode' 
      });
    }
    
    const result = await User.deleteMany({});
    console.log('🗑️ Cleared all users from database:', result);
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} users`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Clear users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Check username availability
// @route   POST /api/users/check-username
// @access  Private
const checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.body; // Changed from req.params to req.body
    
    console.log('🔍 Username check request:', {
      username,
      userId: req.user.id,
      userEmail: req.user.email
    });

    // Validate username format
    if (!username || username.length < 3 || username.length > 30) {
      console.log('❌ Username length validation failed:', username?.length);
      return res.status(400).json({
        success: false,
        available: false,
        message: 'Username must be between 3 and 30 characters'
      });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      console.log('❌ Username format validation failed:', username);
      return res.status(400).json({
        success: false,
        available: false,
        message: 'Username can only contain letters, numbers, and underscores'
      });
    }

    // Check if username exists (excluding current user)
    // First, let's check what users exist in the database
    const allUsers = await User.find({}, 'email username googleId _id');
    console.log('📊 All users in database:', allUsers);

    const existingUser = await User.findOne({ 
      username: { $exists: true, $eq: username }, 
      _id: { $ne: req.user.id } 
    });

    console.log('🔍 Username check result:', {
      username,
      currentUserId: req.user.id,
      existingUser: existingUser ? { 
        id: existingUser._id, 
        email: existingUser.email,
        username: existingUser.username 
      } : null,
      available: !existingUser
    });

    res.json({
      success: true,
      available: !existingUser,
      message: existingUser ? 'Username is already taken' : 'Username is available'
    });
  } catch (error) {
    console.error('❌ Check username error:', error);
    res.status(500).json({
      success: false,
      available: false,
      message: 'Server error while checking username'
    });
  }
};

// @desc    Complete user onboarding
// @route   POST /api/users/complete-onboarding
// @access  Private
const completeOnboarding = async (req, res) => {
  try {
    const { username, phoneNumber, industry } = req.body;
    const userId = req.user.id;

    console.log('🚀 Complete onboarding request:', {
      userId,
      username,
      phoneNumber,
      industry,
      userEmail: req.user.email
    });

    // Validate required fields
    if (!username || !phoneNumber || !industry) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Username, phone number, and industry are required'
      });
    }

    // Check if username is already taken by someone else
    const existingUser = await User.findOne({ 
      username: username, 
      _id: { $ne: userId } 
    });

    if (existingUser) {
      console.log('❌ Username already taken:', username);
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    // Update the user with onboarding data
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username: username,
        phoneNumber: phoneNumber,
        industry: industry,
        onboardingCompleted: true,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-googleId -__v');

    if (!updatedUser) {
      console.log('❌ User not found for update:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User onboarding completed successfully:', {
      userId: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email
    });

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Complete onboarding error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while completing onboarding'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/update-profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, name, phoneNumber, industry } = req.body;

    console.log('🔄 Updating user profile:', {
      userId,
      username,
      name,
      phoneNumber,
      industry
    });

    // Validate required fields
    if (!username || username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username is required and must be at least 3 characters'
      });
    }

    // Check if username is already taken by another user
    const existingUser = await User.findOne({ 
      username: username.trim(),
      _id: { $ne: userId } // Exclude current user
    });

    if (existingUser) {
      console.log('❌ Username already taken:', username.trim());
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username: username.trim(),
        name: name ? name.trim() : undefined,
        phoneNumber: phoneNumber ? phoneNumber.trim() : '',
        industry: industry || ''
      },
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!updatedUser) {
      console.log('❌ User not found for profile update:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User profile updated successfully:', {
      userId: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      industry: updatedUser.industry
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        industry: updatedUser.industry,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        onboardingCompleted: updatedUser.onboardingCompleted
      }
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

module.exports = {
  testAuth,
  debugUsers,
  clearAllUsers,
  checkUsernameAvailability,
  completeOnboarding,
  updateProfile
};
