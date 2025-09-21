/**
 * Users Controller with Standardized Responses
 * Handles all user-related operations with consistent data formatting
 */

const User = require('../models/User');
const Bug = require('../models/Bug');
const { findUserByIdOrGoogleId, getUserStats, validateUserIdentifier } = require('../utils/userUtils');
const {
  standardizeUserReference,
  standardizePoints,
  standardizeDate,
  standardizeUserStats,
  createSuccessResponse,
  createErrorResponse
} = require('../utils/responseStandardizer');

/**
 * Search users by name for mentions
 */
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json(createSuccessResponse({
        users: []
      }, 'User search completed'));
    }

    // Search by name (case insensitive)
    const users = await User.find({
      name: { $regex: q, $options: 'i' },
      hasCompletedOnboarding: true
    })
    .select('_id name email avatar')
    .limit(10)
    .lean();

    const standardizedUsers = users.map(user => standardizeUserReference(user));

    res.json(createSuccessResponse({
      users: standardizedUsers
    }, 'Users found successfully'));

  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json(createErrorResponse(
      'Server error while searching users',
      process.env.NODE_ENV === 'development' ? error.message : null,
      500
    ));
  }
};

/**
 * Get user profile by ID
 */
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('name email role avatar company location bio skills phoneNumber createdAt points')
      .lean();

    if (!user) {
      return res.status(404).json(createErrorResponse(
        'User not found',
        null,
        404
      ));
    }

    const standardizedUser = {
      id: user._id.toString(),
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'developer',
      avatar: user.avatar || '',
      company: user.company || null,
      location: user.location || null,
      bio: user.bio || null,
      skills: user.skills || [],
      phoneNumber: user.phoneNumber || null,
      points: standardizePoints(user.points),
      createdAt: standardizeDate(user.createdAt)
    };

    res.json(createSuccessResponse(
      standardizedUser,
      'User profile retrieved successfully'
    ));

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json(createErrorResponse(
      'Server error while fetching user profile',
      process.env.NODE_ENV === 'development' ? error.message : null,
      500
    ));
  }
};

/**
 * Get user statistics and recent activity
 */
const getUserStatistics = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('📊 Getting user stats for userId:', userId);
    
    // Validate user identifier format
    const validation = validateUserIdentifier(userId);
    if (!validation.valid) {
      return res.status(400).json(createErrorResponse(
        validation.error,
        null,
        400
      ));
    }
    
    // Get user stats using unified helper function
    const { user, stats: userStats } = await getUserStats(userId);
    
    console.log('✅ User found:', user.email);

    // Get recent activity (bugs reported/resolved, comments, etc.)
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
          createdAt: standardizeDate(bug.resolvedAt || bug.createdAt),
          points: 25 // Standard points for resolving a bug
        };
      }
      return null;
    }).filter(Boolean);

    console.log('📊 User stats calculated:', userStats);

    const standardizedResponse = {
      user: standardizeUserReference(user),
      stats: standardizeUserStats(userStats),
      points: standardizePoints(user.points),
      recentActivity: recentActivity,
      activitySummary: {
        totalActivities: Number(recentActivity.length),
        pointsFromActivities: Number(recentActivity.reduce((sum, activity) => sum + activity.points, 0))
      }
    };
    
    res.json(createSuccessResponse(
      standardizedResponse,
      'User statistics retrieved successfully'
    ));

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json(createErrorResponse(
      'Server error while fetching user statistics',
      process.env.NODE_ENV === 'development' ? error.message : null,
      500
    ));
  }
};

/**
 * Get leaderboard data
 */
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10, period = 'all' } = req.query;
    
    console.log('🏆 Getting leaderboard data...');
    console.log('📊 Leaderboard params:', { limit, period });

    // Build aggregation pipeline for leaderboard
    const pipeline = [
      {
        $match: {
          hasCompletedOnboarding: true,
          'points.total': { $gt: 0 }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          username: 1,
          avatar: 1,
          createdAt: 1,
          totalPoints: { $ifNull: ['$points.total', 0] },
          bugsResolved: { $ifNull: ['$stats.bugsResolved', 0] }
        }
      },
      {
        $sort: { totalPoints: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ];

    const leaderboardUsers = await User.aggregate(pipeline);
    
    console.log('✅ Found leaderboard users:', leaderboardUsers.length);

    const standardizedLeaderboard = leaderboardUsers.map((user, index) => ({
      id: user._id.toString(),
      name: user.name || '',
      email: user.email || '',
      username: user.username || null,
      avatar: user.avatar || '',
      points: Number(user.totalPoints || 0),
      bugsFixed: Number(user.bugsResolved || 0),
      rank: Number(index + 1),
      badge: determineBadge(user.totalPoints || 0),
      weeklyPoints: Number(Math.floor((user.totalPoints || 0) * 0.1)), // Mock weekly calculation
      monthlyPoints: Number(Math.floor((user.totalPoints || 0) * 0.3)), // Mock monthly calculation
      joinedAt: standardizeDate(user.createdAt)
    }));

    const leaderboardStats = {
      totalUsers: Number(leaderboardUsers.length),
      topScore: Number(leaderboardUsers[0]?.totalPoints || 0),
      averageScore: Number(
        leaderboardUsers.length > 0 
          ? Math.round(leaderboardUsers.reduce((sum, user) => sum + (user.totalPoints || 0), 0) / leaderboardUsers.length)
          : 0
      ),
      period: String(period)
    };

    res.json(createSuccessResponse({
      leaderboard: standardizedLeaderboard,
      stats: leaderboardStats
    }, 'Leaderboard retrieved successfully'));

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json(createErrorResponse(
      'Server error while fetching leaderboard',
      process.env.NODE_ENV === 'development' ? error.message : null,
      500
    ));
  }
};

/**
 * Determine badge based on points
 */
const determineBadge = (points) => {
  if (points >= 1000) return 'Expert';
  if (points >= 500) return 'Advanced';
  if (points >= 200) return 'Intermediate';
  if (points >= 50) return 'Beginner';
  return 'Newcomer';
};

module.exports = {
  searchUsers,
  getUserProfile,
  getUserStatistics,
  getLeaderboard
};