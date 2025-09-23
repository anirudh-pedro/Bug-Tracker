const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { authLimiter, strictLimiter } = require('../middleware/rateLimiter');
const {
  testAuth,
  debugUsers,
  clearAllUsers,
  checkUsernameAvailability,
  completeOnboarding,
  updateProfile,
  getProfileStatus
} = require('../controller/userController');
const {
  searchUsers,
  getUserProfile,
  getUserStatistics,
  getLeaderboard
} = require('../controller/standardizedUserController');

const router = express.Router();

// @desc    Test token authentication (development only)
// @route   GET /api/users/test-auth
// @access  Private
router.get('/test-auth', authLimiter, authenticate, (req, res, next) => {
  // Only allow test-auth in development environment
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({
      success: false,
      message: 'Endpoint not available in production'
    });
  }
  next();
}, testAuth);

// @desc    Debug endpoint to see all users
// @route   GET /api/users/debug
// @access  Private (Admin only)
router.get('/debug', authLimiter, authenticate, authorize('admin'), debugUsers);

// Note: debug-public endpoint removed for security
// Use admin-authenticated debug endpoint instead

// @desc    Clear all users (for development only)
// @route   DELETE /api/users/clear-all
// @access  Private (Admin only)
router.delete('/clear-all', strictLimiter, authenticate, authorize('admin'), (req, res, next) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({
      success: false,
      message: 'Endpoint not available in production'
    });
  }
  next();
}, clearAllUsers);

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

// @desc    Get current user's profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', authenticate, (req, res) => {
  // Reuse the getUserProfile function with current user's ID
  req.params.userId = req.user._id.toString();
  getUserProfile(req, res);
});

// @desc    Search users by name for mentions
// @route   GET /api/users/search
// @access  Private
router.get('/search', authenticate, searchUsers);

// @desc    Get user profile by ID
// @route   GET /api/users/profile/:userId
// @access  Private
router.get('/profile/:userId', authenticate, getUserProfile);

// @desc    Get user statistics and recent activity
// @route   GET /api/users/stats/:userId
// @access  Private
router.get('/stats/:userId', authenticate, getUserStatistics);

// @desc    Get current user's statistics and recent activity
// @route   GET /api/users/my-stats
// @access  Private
router.get('/my-stats', authenticate, async (req, res) => {
  try {
    // Use the authenticated user's ID from the JWT token
    const userId = req.user.id;
    console.log('📊 Getting current user stats for userId:', userId);
    
    // Get user stats using unified helper function
    const { getUserStats } = require('../utils/userUtils');
    const { user, stats: userStats } = await getUserStats(userId);
    
    console.log('✅ User found:', user.email);

    // Get recent activity (bugs reported/resolved, comments, etc.)
    const Bug = require('../models/Bug');
    const recentBugs = await Bug.find({
      $or: [
        { reportedBy: user._id },
        { resolvedBy: user._id }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('title status createdAt resolvedAt reportedBy resolvedBy')
    .populate('reportedBy', 'name')
    .populate('resolvedBy', 'name')
    .lean()
    .catch(() => []);

    // Format recent activity with standardized data
    const { standardizeDate, createSuccessResponse, standardizeUserStats } = require('../utils/responseStandardizer');
    const recentActivity = recentBugs.map(bug => {
      if (bug.reportedBy && bug.reportedBy._id.toString() === user._id.toString()) {
        return {
          type: 'bug_reported',
          description: `Reported bug: ${bug.title}`,
          createdAt: standardizeDate(bug.createdAt),
          points: 10 // Standard points for reporting a bug
        };
      } else if (bug.resolvedBy && bug.resolvedBy._id.toString() === user._id.toString()) {
        return {
          type: 'bug_resolved', 
          description: `Resolved bug: ${bug.title}`,
          createdAt: standardizeDate(bug.resolvedAt),
          points: 25 // Standard points for resolving a bug
        };
      }
      return null;
    }).filter(Boolean);

    const response = createSuccessResponse({
      stats: standardizeUserStats(userStats),
      recentActivity: recentActivity
    }, 'User statistics retrieved successfully');

    res.json(response);

  } catch (error) {
    console.error('Get current user stats error:', error);
    const { createErrorResponse } = require('../utils/responseStandardizer');
    res.status(500).json(createErrorResponse(
      'Server error while retrieving user statistics',
      process.env.NODE_ENV === 'development' ? error.message : null,
      500
    ));
  }
});

// @desc    Award points to a user
// @route   POST /api/users/award-points
// @access  Private
router.post('/award-points', authenticate, async (req, res) => {
  try {
    const { userId, points, reason } = req.body;

    // Validation
    if (!userId || !points || !reason) {
      return res.status(400).json({
        success: false,
        message: 'User ID, points, and reason are required'
      });
    }

    if (isNaN(points) || parseInt(points) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Points must be a positive number'
      });
    }

    const User = require('../models/User');
    
    // Find the user to award points to
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Use the existing addPoints method from the User model (it handles save internally)
    await targetUser.addPoints(parseInt(points), reason);

    res.json({
      success: true,
      message: `${points} points awarded successfully`,
      data: {
        totalPoints: targetUser.points.total,
        pointsAwarded: parseInt(points),
        reason: reason
      }
    });

  } catch (error) {
    console.error('Award points error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while awarding points'
    });
  }
});

// @desc    Get leaderboard (top users by points)
// @route   GET /api/users/leaderboard
// @access  Private
router.get('/leaderboard', authenticate, getLeaderboard);

module.exports = router;
