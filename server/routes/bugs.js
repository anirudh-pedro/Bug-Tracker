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

    const { 
      title, 
      description, 
      priority, 
      project,
      stepsToReproduce,
      expectedBehavior,
      actualBehavior,
      environment: envDescription,
      category,
      repositoryUrl,
      githubRepo,
      bountyPoints,
      tags
    } = req.body;

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
      stepsToReproduce: stepsToReproduce || '',
      expectedBehavior: expectedBehavior || '',
      actualBehavior: actualBehavior || '',
      category: category || 'Bug',
      tags: tags || [],
      environment: {
        os: 'Unknown',
        browser: 'Unknown',
        version: '1.0.0',
        description: envDescription || ''
      },
      // GitHub integration fields
      githubRepo: githubRepo || null,
      repositoryUrl: repositoryUrl || '',
      bountyPoints: bountyPoints || 0
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

// @desc    Award points for resolving a bug
// @route   POST /api/bugs/:bugId/award-points
// @access  Private
router.post('/:bugId/award-points', authenticate, [
  param('bugId').isMongoId().withMessage('Invalid bug ID'),
  body('points').isInt({ min: 1, max: 1000 }).withMessage('Points must be between 1 and 1000'),
  body('awardedToUserId').isMongoId().withMessage('Valid user ID required'),
  body('comment').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be 1-500 characters')
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

    const { bugId } = req.params;
    const { points, awardedToUserId, comment } = req.body;

    const bug = await Bug.findById(bugId).populate('reportedBy');
    if (!bug) {
      return res.status(404).json({
        success: false,
        message: 'Bug not found'
      });
    }

    // Check if user is the reporter of the bug
    if (bug.reportedBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the bug reporter can award points'
      });
    }

    // Check if bug is resolved
    if (bug.status !== 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Points can only be awarded for resolved bugs'
      });
    }

    // Check if points already awarded
    if (bug.pointsAwarded > 0) {
      return res.status(400).json({
        success: false,
        message: 'Points have already been awarded for this bug'
      });
    }

    const awardedToUser = await User.findById(awardedToUserId);
    if (!awardedToUser) {
      return res.status(404).json({
        success: false,
        message: 'User to award points not found'
      });
    }

    // Award points to user
    await awardedToUser.addPoints(points, 'bug_resolved');

    // Update bug with points information
    bug.pointsAwarded = points;
    bug.awardedTo = awardedToUserId;
    bug.pointsAwardedAt = new Date();

    // Add comment if provided
    if (comment) {
      bug.comments.push({
        author: req.user.id,
        content: comment,
        pointsAwarded: points,
        isResolutionComment: true,
        createdAt: new Date()
      });
    }

    await bug.save();

    res.json({
      success: true,
      message: 'Points awarded successfully',
      data: {
        pointsAwarded: points,
        awardedTo: {
          id: awardedToUser._id,
          name: awardedToUser.name,
          totalPoints: awardedToUser.points.total
        }
      }
    });

  } catch (error) {
    console.error('Award points error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Add comment to a bug
// @route   POST /api/bugs/:bugId/comments
// @access  Private
router.post('/:bugId/comments', authenticate, [
  param('bugId').isMongoId().withMessage('Invalid bug ID'),
  body('content').trim().notEmpty().withMessage('Comment content required'),
  body('githubProfile').optional().trim().isURL().withMessage('Valid GitHub profile URL required'),
  body('githubPullRequest').optional().isObject().withMessage('GitHub PR must be an object')
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

    const { bugId } = req.params;
    const { content, githubProfile, githubPullRequest } = req.body;

    const bug = await Bug.findById(bugId);
    if (!bug) {
      return res.status(404).json({
        success: false,
        message: 'Bug not found'
      });
    }

    const newComment = {
      author: req.user.id,
      content,
      githubProfile,
      githubPullRequest,
      createdAt: new Date()
    };

    bug.comments.push(newComment);
    await bug.save();

    // Populate the new comment
    await bug.populate('comments.author', 'name email avatar githubProfile');

    const addedComment = bug.comments[bug.comments.length - 1];

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: addedComment
      }
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
