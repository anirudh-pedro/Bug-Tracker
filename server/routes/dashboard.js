const express = require('express');
const mongoose = require('mongoose');
const { query, validationResult } = require('express-validator');
const Bug = require('../models/Bug');
const Project = require('../models/Project');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @desc    Get dashboard overview
// @route   GET /api/dashboard
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Return mock data if MongoDB is not connected
      return res.json({
        success: true,
        data: {
          statistics: {
            totalBugs: 42,
            openBugs: 15,
            resolvedBugs: 27,
            totalProjects: 8,
            activeProjects: 5,
            totalUsers: 12,
            resolutionRate: 64
          },
          recentBugs: [
            {
              _id: '1',
              title: 'Login page not responsive',
              status: 'open',
              priority: 'high',
              createdAt: new Date(),
              reporter: { name: 'John Doe', email: 'john@example.com' }
            }
          ],
          recentProjects: [
            {
              _id: '1',
              name: 'Bug Tracker App',
              status: 'active',
              createdAt: new Date(),
              owner: { name: 'Anirudh', email: 'anirudh@example.com' }
            }
          ],
          charts: {
            bugsByPriority: [
              { _id: 'high', count: 8 },
              { _id: 'medium', count: 15 },
              { _id: 'low', count: 12 },
              { _id: 'critical', count: 7 }
            ],
            bugsByStatus: [
              { _id: 'open', count: 15 },
              { _id: 'in-progress', count: 10 },
              { _id: 'resolved', count: 20 },
              { _id: 'closed', count: 7 }
            ]
          }
        },
        note: 'Using mock data - MongoDB not connected'
      });
    }

    // Get real statistics from MongoDB
    const [
      totalBugs,
      openBugs,
      resolvedBugs,
      totalProjects,
      activeProjects,
      totalUsers
    ] = await Promise.all([
      Bug.countDocuments(),
      Bug.countDocuments({ status: 'open' }),
      Bug.countDocuments({ status: { $in: ['resolved', 'closed'] } }),
      Project.countDocuments(),
      Project.countDocuments({ status: 'active' }),
      User.countDocuments({ isActive: true })
    ]);

    // Get recent bugs (last 10)
    const recentBugs = await Bug.find()
      .populate('reporter', 'name email avatar')
      .populate('assignee', 'name email avatar')
      .populate('project', 'name key')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get recent projects (last 5)
    const recentProjects = await Project.find()
      .populate('owner', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get bugs by priority
    const bugsByPriority = await Bug.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get bugs by status
    const bugsByStatus = await Bug.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const dashboardData = {
      statistics: {
        totalBugs,
        openBugs,
        resolvedBugs,
        totalProjects,
        activeProjects,
        totalUsers,
        resolutionRate: totalBugs > 0 ? Math.round((resolvedBugs / totalBugs) * 100) : 0
      },
      recentBugs,
      recentProjects,
      charts: {
        bugsByPriority,
        bugsByStatus
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
