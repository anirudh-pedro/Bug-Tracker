const express = require('express');
const mongoose = require('mongoose');
const { body, param, query, validationResult } = require('express-validator');
const Bug = require('../models/Bug');
const Project = require('../models/Project');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all bugs
// @route   GET /api/bugs
// @access  Private
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  query('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed']).withMessage('Invalid status'),
  query('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
  query('search').optional().trim().isLength({ min: 1 }).withMessage('Search term required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Return mock data if MongoDB is not connected
      const mockBugs = [
        {
          _id: '1',
          title: 'Sample Bug 1',
          description: 'This is a sample bug for testing',
          status: 'open',
          priority: 'high',
          createdAt: new Date(),
          reporter: { name: 'Test User', email: 'test@example.com' }
        }
      ];

      return res.json({
        success: true,
        data: {
          bugs: mockBugs,
          pagination: {
            currentPage: parseInt(page),
            totalPages: 1,
            totalBugs: 1,
            hasNext: false,
            hasPrev: false
          }
        },
        note: 'Using mock data - MongoDB not connected'
      });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get bugs with population from MongoDB
    const bugs = await Bug.find(query)
      .populate('reporter', 'name email avatar')
      .populate('assignee', 'name email avatar')
      .populate('project', 'name key')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Bug.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        bugs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalBugs: total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get bugs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bugs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Create new bug
// @route   POST /api/bugs
// @access  Private
router.post('/', authenticate, [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('priority').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
  body('project').optional().isMongoId().withMessage('Invalid project ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Cannot create bugs at this time.'
      });
    }

    const { title, description, priority, project } = req.body;

    // Generate bug ID
    const bugCount = await Bug.countDocuments();
    const bugId = `BUG-${String(bugCount + 1).padStart(4, '0')}`;

    const newBug = new Bug({
      bugId,
      title,
      description,
      priority,
      status: 'open',
      reporter: req.user._id,
      project: project || null,
      environment: {
        os: 'Unknown',
        browser: 'Unknown',
        version: '1.0.0'
      }
    });

    await newBug.save();

    // Populate the bug before returning
    const populatedBug = await Bug.findById(newBug._id)
      .populate('reporter', 'name email avatar')
      .populate('project', 'name key')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Bug created successfully',
      data: { bug: populatedBug }
    });

  } catch (error) {
    console.error('Create bug error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating bug',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
