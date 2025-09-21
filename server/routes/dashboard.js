const express = require('express');
const { query } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const {
  getDashboardOverview,
  getDashboardLeaderboard
} = require('../controller/dashboardController');

const router = express.Router();

// @desc    Get dashboard overview
// @route   GET /api/dashboard
// @access  Private
router.get('/', authenticate, getDashboardOverview);

// @desc    Get leaderboard for dashboard
// @route   GET /api/dashboard/leaderboard
// @access  Private
router.get('/leaderboard', authenticate, [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1-50')
], getDashboardLeaderboard);

module.exports = router;