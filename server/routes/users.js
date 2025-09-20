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

// @desc    Search users by name for mentions
// @route   GET /api/users/search
// @access  Private
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { users: [] }
      });
    }

    const User = require('../models/User');
    
    // Search by name (case insensitive)
    const users = await User.find({
      name: { $regex: q, $options: 'i' },
      hasCompletedOnboarding: true
    })
    .select('_id name email githubProfile')
    .limit(10);

    res.json({
      success: true,
      data: { users }
    });

  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user profile by ID
// @route   GET /api/users/profile/:userId
// @access  Private
router.get('/profile/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const User = require('../models/User');
    const user = await User.findById(userId)
      .select('name email role avatar githubProfile company location bio skills phoneNumber createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user statistics and recent activity
// @route   GET /api/users/stats/:userId
// @access  Private
router.get('/stats/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const User = require('../models/User');
    const Bug = require('../models/Bug');
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get bug statistics
    const [bugsReported, bugsResolved, pullRequests] = await Promise.all([
      Bug.countDocuments({ reportedBy: userId }),
      Bug.countDocuments({ resolvedBy: userId }),
      Bug.aggregate([
        { $match: { 'pullRequests.author.userId': userId } },
        { $unwind: '$pullRequests' },
        { $match: { 'pullRequests.author.userId': userId } },
        { $count: 'total' }
      ])
    ]);

    // Get recent activity (bugs reported/resolved, comments, etc.)
    const recentBugs = await Bug.find({
      $or: [
        { reportedBy: userId },
        { resolvedBy: userId }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('title status createdAt resolvedAt reportedBy resolvedBy')
    .populate('reportedBy', 'name')
    .populate('resolvedBy', 'name');

    // Format recent activity
    const recentActivity = recentBugs.map(bug => {
      if (bug.reportedBy._id.toString() === userId) {
        return {
          type: 'bug_reported',
          description: `Reported bug: ${bug.title}`,
          createdAt: bug.createdAt
        };
      } else if (bug.resolvedBy && bug.resolvedBy._id.toString() === userId) {
        return {
          type: 'bug_resolved',
          description: `Resolved bug: ${bug.title}`,
          createdAt: bug.resolvedAt || bug.createdAt
        };
      }
      return null;
    }).filter(Boolean);

    const stats = {
      totalPoints: user.points?.total || 0,
      bugsReported: bugsReported,
      bugsResolved: bugsResolved,
      pullRequests: pullRequests[0]?.total || 0
    };

    res.json({
      success: true,
      data: { 
        stats,
        recentActivity: recentActivity.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
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

module.exports = router;
