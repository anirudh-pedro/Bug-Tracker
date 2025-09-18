const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Bug = require('../models/Bug');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @desc    Link GitHub repository to a bug
// @route   POST /api/github/link-repo/:bugId
// @access  Private
router.post('/link-repo/:bugId', authenticate, [
  param('bugId').isMongoId().withMessage('Invalid bug ID'),
  body('repoUrl').isURL().withMessage('Valid repository URL required'),
  body('owner').trim().notEmpty().withMessage('Repository owner required'),
  body('name').trim().notEmpty().withMessage('Repository name required'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be boolean')
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
    const { repoUrl, owner, name, isPublic = true } = req.body;

    const bug = await Bug.findById(bugId);
    if (!bug) {
      return res.status(404).json({
        success: false,
        message: 'Bug not found'
      });
    }

    // Check if user is the reporter or has permission to link repo
    if (bug.reportedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the bug reporter or admin can link repository'
      });
    }

    // Update bug with GitHub repo information
    bug.githubRepo = {
      url: repoUrl,
      owner,
      name,
      isPublic
    };

    await bug.save();

    res.json({
      success: true,
      message: 'Repository linked successfully',
      data: {
        githubRepo: bug.githubRepo
      }
    });

  } catch (error) {
    console.error('Link repository error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Record a fork for a bug
// @route   POST /api/github/fork/:bugId
// @access  Private
router.post('/fork/:bugId', authenticate, [
  param('bugId').isMongoId().withMessage('Invalid bug ID'),
  body('githubUsername').trim().notEmpty().withMessage('GitHub username required'),
  body('forkUrl').isURL().withMessage('Valid fork URL required')
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
    const { githubUsername, forkUrl } = req.body;

    const bug = await Bug.findById(bugId);
    if (!bug) {
      return res.status(404).json({
        success: false,
        message: 'Bug not found'
      });
    }

    // Check if user already forked this repo
    const existingFork = bug.forks.find(fork => fork.userId && fork.userId.toString() === req.user.id);
    if (existingFork) {
      return res.status(400).json({
        success: false,
        message: 'You have already forked this repository'
      });
    }

    // Add fork to bug
    bug.forks.push({
      githubUsername,
      userId: req.user.id,
      forkUrl,
      createdAt: new Date()
    });

    await bug.save();

    // Update user's GitHub profile if not set
    if (!req.user.githubProfile.username) {
      await User.findByIdAndUpdate(req.user.id, {
        'githubProfile.username': githubUsername,
        'githubProfile.url': `https://github.com/${githubUsername}`
      });
    }

    res.json({
      success: true,
      message: 'Fork recorded successfully',
      data: {
        forkCount: bug.forks.length,
        userFork: bug.forks[bug.forks.length - 1]
      }
    });

  } catch (error) {
    console.error('Record fork error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Submit pull request for a bug
// @route   POST /api/github/pull-request/:bugId
// @access  Private
router.post('/pull-request/:bugId', authenticate, [
  param('bugId').isMongoId().withMessage('Invalid bug ID'),
  body('prUrl').isURL().withMessage('Valid pull request URL required'),
  body('title').trim().notEmpty().withMessage('Pull request title required'),
  body('githubUsername').trim().notEmpty().withMessage('GitHub username required'),
  body('prNumber').isInt({ min: 1 }).withMessage('Valid PR number required')
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
    const { prUrl, title, githubUsername, prNumber } = req.body;

    const bug = await Bug.findById(bugId);
    if (!bug) {
      return res.status(404).json({
        success: false,
        message: 'Bug not found'
      });
    }

    // Check if PR already exists
    const existingPR = bug.pullRequests.find(pr => pr.number === prNumber);
    if (existingPR) {
      return res.status(400).json({
        success: false,
        message: 'Pull request already recorded'
      });
    }

    // Add pull request to bug
    bug.pullRequests.push({
      number: prNumber,
      url: prUrl,
      title,
      author: {
        githubUsername,
        userId: req.user.id
      },
      status: 'open',
      createdAt: new Date()
    });

    // Update user statistics
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'statistics.pullRequestsSubmitted': 1 }
    });

    await bug.save();

    res.json({
      success: true,
      message: 'Pull request submitted successfully',
      data: {
        pullRequest: bug.pullRequests[bug.pullRequests.length - 1]
      }
    });

  } catch (error) {
    console.error('Submit pull request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update pull request status (for webhooks or manual updates)
// @route   PUT /api/github/pull-request/:bugId/:prNumber
// @access  Private
router.put('/pull-request/:bugId/:prNumber', authenticate, [
  param('bugId').isMongoId().withMessage('Invalid bug ID'),
  param('prNumber').isInt({ min: 1 }).withMessage('Valid PR number required'),
  body('status').isIn(['open', 'merged', 'closed', 'draft']).withMessage('Invalid status')
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

    const { bugId, prNumber } = req.params;
    const { status } = req.body;

    const bug = await Bug.findById(bugId);
    if (!bug) {
      return res.status(404).json({
        success: false,
        message: 'Bug not found'
      });
    }

    const prIndex = bug.pullRequests.findIndex(pr => pr.number === parseInt(prNumber));
    if (prIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Pull request not found'
      });
    }

    const pullRequest = bug.pullRequests[prIndex];

    // Update PR status
    pullRequest.status = status;
    if (status === 'merged') {
      pullRequest.mergedAt = new Date();
      
      // If merged, this could resolve the bug
      if (bug.status === 'open' || bug.status === 'in-progress') {
        bug.status = 'resolved';
        bug.resolvedAt = new Date();
        bug.resolvedBy = pullRequest.author.userId;
        bug.resolutionPullRequest = {
          url: pullRequest.url,
          title: pullRequest.title,
          number: pullRequest.number
        };
      }

      // Update user statistics
      if (pullRequest.author.userId) {
        await User.findByIdAndUpdate(pullRequest.author.userId, {
          $inc: { 'statistics.pullRequestsMerged': 1 }
        });
      }
    }

    await bug.save();

    res.json({
      success: true,
      message: 'Pull request status updated successfully',
      data: {
        pullRequest: bug.pullRequests[prIndex],
        bugStatus: bug.status
      }
    });

  } catch (error) {
    console.error('Update pull request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get GitHub activity for a bug
// @route   GET /api/github/activity/:bugId
// @access  Private
router.get('/activity/:bugId', authenticate, [
  param('bugId').isMongoId().withMessage('Invalid bug ID')
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

    const bug = await Bug.findById(bugId)
      .populate('forks.userId', 'name email githubProfile')
      .populate('pullRequests.author.userId', 'name email githubProfile')
      .lean();

    if (!bug) {
      return res.status(404).json({
        success: false,
        message: 'Bug not found'
      });
    }

    res.json({
      success: true,
      data: {
        githubRepo: bug.githubRepo,
        forks: bug.forks || [],
        pullRequests: bug.pullRequests || [],
        statistics: {
          forkCount: bug.forks ? bug.forks.length : 0,
          prCount: bug.pullRequests ? bug.pullRequests.length : 0,
          mergedPRs: bug.pullRequests ? bug.pullRequests.filter(pr => pr.status === 'merged').length : 0
        }
      }
    });

  } catch (error) {
    console.error('Get GitHub activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;