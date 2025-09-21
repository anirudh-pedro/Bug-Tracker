/**
 * Dashboard Controller with Standardized Responses
 * Handles dashboard data with consistent formatting
 */

const mongoose = require('mongoose');
const Bug = require('../models/Bug');
const Project = require('../models/Project');
const User = require('../models/User');
const {
  standardizeBugResponse,
  standardizeUserReference,
  standardizeProjectReference,
  standardizeDate,
  createSuccessResponse,
  createErrorResponse
} = require('../utils/responseStandardizer');

/**
 * Get dashboard overview with statistics and recent activity
 */
const getDashboardOverview = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Return standardized mock data if MongoDB is not connected
      const mockData = {
        statistics: {
          totalBugs: 42,
          openBugs: 15,
          resolvedBugs: 27,
          inProgressBugs: 8,
          totalProjects: 8,
          activeProjects: 5,
          totalUsers: 12,
          resolutionRate: Number(((27 / 42) * 100).toFixed(1))
        },
        recentBugs: [
          standardizeBugResponse({
            _id: '1',
            bugId: 'BUG-001',
            title: 'Login page not responsive',
            status: 'open',
            priority: 'high',
            bountyPoints: 50,
            createdAt: new Date(),
            reportedBy: { 
              _id: 'user1',
              name: 'John Doe', 
              email: 'john@example.com' 
            }
          })
        ],
        recentProjects: [
          standardizeProjectReference({
            _id: '1',
            name: 'Bug Tracker App',
            key: 'BTA',
            description: 'Main bug tracking application',
            status: 'active',
            createdAt: new Date()
          })
        ],
        charts: {
          bugsByPriority: [
            { category: 'high', count: 8, percentage: Number(((8/42)*100).toFixed(1)) },
            { category: 'medium', count: 15, percentage: Number(((15/42)*100).toFixed(1)) },
            { category: 'low', count: 12, percentage: Number(((12/42)*100).toFixed(1)) },
            { category: 'critical', count: 7, percentage: Number(((7/42)*100).toFixed(1)) }
          ],
          bugsByStatus: [
            { category: 'open', count: 15, percentage: Number(((15/42)*100).toFixed(1)) },
            { category: 'in-progress', count: 8, percentage: Number(((8/42)*100).toFixed(1)) },
            { category: 'resolved', count: 12, percentage: Number(((12/42)*100).toFixed(1)) },
            { category: 'closed', count: 7, percentage: Number(((7/42)*100).toFixed(1)) }
          ]
        },
        trends: {
          bugsCreatedThisWeek: 12,
          bugsResolvedThisWeek: 8,
          averageResolutionTime: 3.5, // days
          mostActiveDeveloper: 'John Doe'
        }
      };

      return res.json(createSuccessResponse(
        mockData,
        'Dashboard data retrieved successfully (mock data - MongoDB not connected)'
      ));
    }

    // Get real statistics from MongoDB
    const [
      totalBugs,
      openBugs,
      inProgressBugs,
      resolvedBugs,
      closedBugs,
      totalProjects,
      activeProjects,
      totalUsers
    ] = await Promise.all([
      Bug.countDocuments(),
      Bug.countDocuments({ status: 'open' }),
      Bug.countDocuments({ status: 'in-progress' }),
      Bug.countDocuments({ status: 'resolved' }),
      Bug.countDocuments({ status: 'closed' }),
      Project.countDocuments(),
      Project.countDocuments({ status: 'active' }),
      User.countDocuments({ isActive: true })
    ]);

    // Calculate resolution rate
    const totalResolved = resolvedBugs + closedBugs;
    const resolutionRate = totalBugs > 0 ? Number(((totalResolved / totalBugs) * 100).toFixed(1)) : 0;

    // Get recent bugs (last 10) with population
    const recentBugsData = await Bug.find()
      .populate('reportedBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'name key description')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const recentBugs = recentBugsData.map(bug => standardizeBugResponse(bug));

    // Get recent projects (last 5)
    const recentProjectsData = await Project.find()
      .populate('owner', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentProjects = recentProjectsData.map(project => ({
      id: project._id.toString(),
      name: project.name || '',
      key: project.key || '',
      description: project.description || '',
      status: project.status || 'active',
      owner: standardizeUserReference(project.owner),
      createdAt: standardizeDate(project.createdAt),
      totalBugs: 0, // Could be calculated with aggregation
      openBugs: 0   // Could be calculated with aggregation
    }));

    // Get chart data with aggregation
    const [bugsByPriority, bugsByStatus] = await Promise.all([
      Bug.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Bug.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    // Standardize chart data
    const standardizedBugsByPriority = bugsByPriority.map(item => ({
      category: item._id || 'unknown',
      count: Number(item.count),
      percentage: totalBugs > 0 ? Number(((item.count / totalBugs) * 100).toFixed(1)) : 0
    }));

    const standardizedBugsByStatus = bugsByStatus.map(item => ({
      category: item._id || 'unknown',
      count: Number(item.count),
      percentage: totalBugs > 0 ? Number(((item.count / totalBugs) * 100).toFixed(1)) : 0
    }));

    // Calculate trends (simplified for now)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [bugsCreatedThisWeek, bugsResolvedThisWeek] = await Promise.all([
      Bug.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      Bug.countDocuments({ 
        resolvedAt: { $gte: oneWeekAgo },
        status: { $in: ['resolved', 'closed'] }
      })
    ]);

    const dashboardData = {
      statistics: {
        totalBugs: Number(totalBugs),
        openBugs: Number(openBugs),
        inProgressBugs: Number(inProgressBugs),
        resolvedBugs: Number(resolvedBugs),
        closedBugs: Number(closedBugs),
        totalProjects: Number(totalProjects),
        activeProjects: Number(activeProjects),
        totalUsers: Number(totalUsers),
        resolutionRate: resolutionRate
      },
      recentBugs: recentBugs,
      recentProjects: recentProjects,
      charts: {
        bugsByPriority: standardizedBugsByPriority,
        bugsByStatus: standardizedBugsByStatus
      },
      trends: {
        bugsCreatedThisWeek: Number(bugsCreatedThisWeek),
        bugsResolvedThisWeek: Number(bugsResolvedThisWeek),
        averageResolutionTime: 0, // Would need more complex calculation
        productivityScore: bugsResolvedThisWeek > 0 ? 
          Number(((bugsResolvedThisWeek / Math.max(bugsCreatedThisWeek, 1)) * 100).toFixed(1)) : 0
      },
      lastUpdated: standardizeDate(new Date())
    };

    res.json(createSuccessResponse(
      dashboardData,
      'Dashboard data retrieved successfully'
    ));

  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json(createErrorResponse(
      'Server error while fetching dashboard data',
      process.env.NODE_ENV === 'development' ? error.message : null,
      500
    ));
  }
};

/**
 * Get leaderboard for dashboard
 */
const getDashboardLeaderboard = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    if (mongoose.connection.readyState !== 1) {
      // Mock leaderboard data
      const mockLeaderboard = [
        {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          points: 450,
          bugsFixed: 15,
          rank: 1,
          badge: 'Advanced'
        },
        {
          id: 'user2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          points: 320,
          bugsFixed: 12,
          rank: 2,
          badge: 'Intermediate'
        }
      ];

      return res.json(createSuccessResponse({
        leaderboard: mockLeaderboard,
        totalParticipants: Number(mockLeaderboard.length)
      }, 'Leaderboard retrieved successfully (mock data)'));
    }

    // Get real leaderboard data
    const leaderboardData = await User.aggregate([
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
          avatar: 1,
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
    ]);

    const standardizedLeaderboard = leaderboardData.map((user, index) => ({
      id: user._id.toString(),
      name: user.name || '',
      email: user.email || '',
      avatar: user.avatar || '',
      points: Number(user.totalPoints || 0),
      bugsFixed: Number(user.bugsResolved || 0),
      rank: Number(index + 1),
      badge: determineBadge(user.totalPoints || 0)
    }));

    res.json(createSuccessResponse({
      leaderboard: standardizedLeaderboard,
      totalParticipants: Number(leaderboardData.length)
    }, 'Leaderboard retrieved successfully'));

  } catch (error) {
    console.error('Dashboard leaderboard error:', error);
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
  getDashboardOverview,
  getDashboardLeaderboard
};