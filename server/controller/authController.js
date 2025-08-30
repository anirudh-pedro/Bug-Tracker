const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
console.log('🔧 Google Client ID configured:', GOOGLE_CLIENT_ID ? 'YES' : 'NO');
console.log('🔧 Client ID preview:', GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'MISSING');
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// @desc    Authenticate user with Google
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    console.log('� Google auth request received');
    console.log('📋 ID Token present:', !!idToken);
    
    if (!idToken) {
      console.log('❌ No ID token provided');
      return res.status(400).json({ success: false, message: 'No ID token provided' });
    }
    
    console.log('🔍 Verifying Google ID token...');
    console.log('🔍 Using Client ID:', GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'MISSING');
    console.log('🔍 Token length:', idToken ? idToken.length : 0);
    
    // Verify Google ID token with retry logic
    let ticket, payload;
    try {
      ticket = await client.verifyIdToken({ 
        idToken, 
        audience: GOOGLE_CLIENT_ID 
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.log('⚠️ First verification attempt failed, trying with different audience...');
      console.log('🔍 Verify error details:', verifyError.message);
      
      // Try with web client ID as audience (common fix)
      try {
        ticket = await client.verifyIdToken({ 
          idToken,
          audience: [
            GOOGLE_CLIENT_ID,
            '505775401765-43mt53j5jri7f6pqtlq37b99s0ui216d.apps.googleusercontent.com' // Web client ID
          ]
        });
        payload = ticket.getPayload();
        console.log('✅ Token verified with alternative audience');
      } catch (retryError) {
        console.log('❌ Token verification failed completely:', retryError.message);
        throw retryError;
      }
    }
    
    console.log('🔍 Token payload received:', !!payload);
    
    const { sub: googleId, email, name, picture } = payload;
    
    console.log('✅ Google token verified for user:', email);
    console.log('👤 User details:', { googleId, email, name });

    // Find or create user
    let user = await User.findOne({ googleId });
    let isNewUser = false;
    
    if (!user) {
      console.log('🆕 Creating new user');
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        role: 'developer', // default role
        hasCompletedOnboarding: false
      });
      isNewUser = true;
      console.log('✅ New user created:', user._id);
    } else {
      console.log('👋 Existing user found:', user._id);
      console.log('🔍 User onboarding status:', {
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        username: user.username,
        industry: user.industry
      });
      
      // Update last login
      user.lastLoginAt = new Date();
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);
    console.log('🎫 JWT token generated for user:', user._id);

    // Check if user needs onboarding - must have both username and onboarding completed
    const hasValidUsername = user.username && user.username.trim().length > 0;
    const hasCompletedOnboarding = user.hasCompletedOnboarding === true;
    const requiresOnboarding = !hasValidUsername || !hasCompletedOnboarding;
    
    console.log('🎯 Onboarding check details:', {
      hasValidUsername,
      hasCompletedOnboarding,
      requiresOnboarding,
      username: user.username,
      hasCompletedOnboarding: user.hasCompletedOnboarding
    });

    const responseData = {
      success: true,
      token,
      isNewUser,
      requiresOnboarding,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        industry: user.industry,
        phoneNumber: user.phoneNumber,
        hasCompletedOnboarding: user.hasCompletedOnboarding
      }
    };
    
    console.log('📤 Sending response:', {
      isNewUser,
      requiresOnboarding,
      userId: user._id,
      username: user.username
    });

    res.json(responseData);

  } catch (error) {
    console.error('❌ Google auth error:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    
    let errorMessage = 'Invalid Google token';
    
    if (error.message.includes('Token used too early')) {
      errorMessage = 'Token used too early. Please try again.';
    } else if (error.message.includes('Token used too late')) {
      errorMessage = 'Token expired. Please sign in again.';
    } else if (error.message.includes('Invalid token')) {
      errorMessage = 'Invalid Google token. Please sign in again.';
    } else if (error.message.includes('audience')) {
      errorMessage = 'Token audience mismatch. Please check configuration.';
    }
    
    res.status(401).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-googleId -__v');
    
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
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
const refreshToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while refreshing token'
    });
  }
};

module.exports = {
  googleAuth,
  getCurrentUser,
  refreshToken
};
