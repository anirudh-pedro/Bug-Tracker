const express = require('express');
const router = express.Router();

// @desc    Test route
// @route   GET /api/test
// @access  Public
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bug Tracker API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// @desc    Health check
// @route   GET /api/test/health
// @access  Public
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
