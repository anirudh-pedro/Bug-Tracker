const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const {
  getAllBugs,
  getBugById,
  createBug,
  updateBug,
  deleteBug,
  addComment
} = require('../controller/bugsController');

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
], getAllBugs);

// @desc    Get single bug
// @route   GET /api/bugs/:identifier
// @access  Private
router.get('/:identifier', authenticate, [
  param('identifier').notEmpty().withMessage('Bug identifier is required')
], getBugById);

// @desc    Create new bug
// @route   POST /api/bugs
// @access  Private
router.post('/', authenticate, [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be low, medium, high, or critical'),
  body('projectId')
    .optional()
    .isMongoId()
    .withMessage('Project ID must be valid MongoDB ObjectId'),
  body('bountyPoints')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Bounty points must be between 0 and 1000')
], createBug);

// @desc    Update bug
// @route   PUT /api/bugs/:identifier
// @access  Private
router.put('/:identifier', authenticate, [
  param('identifier').notEmpty().withMessage('Bug identifier is required'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('status')
    .optional()
    .isIn(['open', 'in-progress', 'resolved', 'closed'])
    .withMessage('Status must be open, in-progress, resolved, or closed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be low, medium, high, or critical'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Assigned to must be valid MongoDB ObjectId'),
  body('bountyPoints')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Bounty points must be between 0 and 1000')
], updateBug);

// @desc    Delete bug
// @route   DELETE /api/bugs/:identifier
// @access  Private
router.delete('/:identifier', authenticate, [
  param('identifier').notEmpty().withMessage('Bug identifier is required')
], deleteBug);

// @desc    Add comment to bug
// @route   POST /api/bugs/:identifier/comments
// @access  Private
router.post('/:identifier/comments', authenticate, [
  param('identifier').notEmpty().withMessage('Bug identifier is required'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment content must be between 1 and 1000 characters'),
  body('isResolutionComment')
    .optional()
    .isBoolean()
    .withMessage('isResolutionComment must be boolean')
], addComment);

module.exports = router;