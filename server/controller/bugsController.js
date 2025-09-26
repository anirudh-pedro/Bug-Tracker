/**
 * Bugs Controller with Standardized Responses
 * Handles all bug-related operations with consistent data formatting
 */

const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Bug = require('../models/Bug');
const Project = require('../models/Project');
const { 
  findBugByIdOrBugId, 
  validateBugIdentifier, 
  getBugWithStandardPopulation,
  standardBugPopulation
} = require('../utils/bugUtils');
const { awardPointsToUser } = require('../utils/pointsSystem');
const {
  standardizeBugResponse,
  standardizePagination,
  standardizeUserReference,
  standardizeDate,
  createSuccessResponse,
  createErrorResponse
} = require('../utils/responseStandardizer');

/**
 * Get all bugs with filtering, sorting, and pagination
 */
const getAllBugs = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(createErrorResponse(
        'Validation failed',
        errors.array(),
        400
      ));
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
      const mockBug = standardizeBugResponse({
        _id: '1',
        bugId: 'BUG-001',
        title: 'Sample Bug 1',
        description: 'This is a sample bug for testing',
        status: 'open',
        priority: 'high',
        bountyPoints: 50,
        createdAt: new Date(),
        reportedBy: {
          _id: 'user1',
          name: 'Test User',
          email: 'test@example.com'
        }
      });

      return res.json(createSuccessResponse({
        bugs: [mockBug],
        pagination: standardizePagination({
          currentPage: parseInt(page),
          totalPages: 1,
          totalItems: 1,
          hasNext: false,
          hasPrev: false,
          limit: parseInt(limit)
        })
      }, 'Bugs retrieved successfully (mock data - MongoDB not connected)'));
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get bugs with standardized population
    const bugsQuery = Bug.find(query);
    
    // Apply standard population
    for (const populateConfig of standardBugPopulation) {
      bugsQuery.populate(populateConfig);
    }

    const bugs = await bugsQuery
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalBugs = await Bug.countDocuments(query);
    const totalPages = Math.ceil(totalBugs / parseInt(limit));

    // Standardize bug responses
    const standardizedBugs = bugs.map(bug => standardizeBugResponse(bug));
    
    // Debug: Log the bug IDs we found
    console.log('📋 Found bugs count:', standardizedBugs.length);
    if (standardizedBugs.length > 0) {
      console.log('🐛 Sample bug IDs:', standardizedBugs.slice(0, 3).map(bug => ({
        id: bug.id,
        _id: bug._id,
        bugId: bug.bugId
      })));
    }

    const paginationData = standardizePagination({
      currentPage: parseInt(page),
      totalPages,
      totalItems: totalBugs,
      hasNext: parseInt(page) < totalPages,
      hasPrev: parseInt(page) > 1,
      limit: parseInt(limit)
    });

    res.json(createSuccessResponse({
      bugs: standardizedBugs,
      pagination: paginationData
    }, 'Bugs retrieved successfully'));

  } catch (error) {
    console.error('Get bugs error:', error);
    res.status(500).json(createErrorResponse(
      'Server error while fetching bugs',
      process.env.NODE_ENV === 'development' ? error.message : null,
      500
    ));
  }
};

/**
 * Get a specific bug by ID or bugId
 */
const getBugById = async (req, res) => {
  try {
    console.log('🔍 getBugById called with identifier:', req.params.identifier);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json(createErrorResponse(
        'Validation failed',
        errors.array(),
        400
      ));
    }

    const { identifier } = req.params;
    console.log('🎯 Processing bug identifier:', identifier);

    const validation = validateBugIdentifier(identifier);
    if (!validation.valid) {
      console.log('❌ Invalid bug identifier format:', identifier, 'Error:', validation.error);
      return res.status(400).json(createErrorResponse(
        validation.error || 'Invalid bug identifier format',
        null,
        400
      ));
    }

    console.log('🔍 Searching for bug with identifier:', identifier);
    const bug = await findBugByIdOrBugId(identifier);
    console.log('📋 Bug lookup result:', bug ? 'FOUND' : 'NOT FOUND');

    if (!bug) {
      return res.status(404).json(createErrorResponse(
        'Bug not found',
        null,
        404
      ));
    }

    const standardizedBug = standardizeBugResponse(bug);

    res.json(createSuccessResponse(
      standardizedBug,
      'Bug retrieved successfully'
    ));

  } catch (error) {
    console.error('❌ Get bug by ID error:', error.message);
    console.error('🔍 Error stack:', error.stack);
    console.error('🎯 Identifier that caused error:', req.params.identifier);
    res.status(500).json(createErrorResponse(
      'Server error while fetching bug',
      process.env.NODE_ENV === 'development' ? error.message : null,
      500
    ));
  }
};

/**
 * Create a new bug
 */
const createBug = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(createErrorResponse(
        'Validation failed',
        errors.array(),
        400
      ));
    }

    const { title, description, priority = 'medium', projectId, bountyPoints = 0 } = req.body;

    // Validate project if provided
    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json(createErrorResponse(
          'Project not found',
          null,
          404
        ));
      }
    }

    // Create bug
    const bugData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      reportedBy: req.user.id,
      bountyPoints: Number(bountyPoints),
      status: 'open'
    };

    if (projectId) {
      bugData.project = projectId;
    }

    const bug = await Bug.create(bugData);

    // Get the created bug with population
    const populatedBug = await getBugWithStandardPopulation(bug._id);

    // Award points to reporter
    try {
      await awardPointsToUser(req.user.id, 10, 'bug_reported', bug._id);
    } catch (pointsError) {
      console.error('Error awarding points for bug creation:', pointsError);
      // Don't fail the request if points awarding fails
    }

    const standardizedBug = standardizeBugResponse(populatedBug);

    res.status(201).json(createSuccessResponse(
      standardizedBug,
      'Bug created successfully'
    ));

  } catch (error) {
    console.error('Create bug error:', error);
    res.status(500).json(createErrorResponse(
      'Server error while creating bug',
      process.env.NODE_ENV === 'development' ? error.message : null,
      500
    ));
  }
};

/**
 * Update an existing bug
 */
const updateBug = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(createErrorResponse(
        'Validation failed',
        errors.array(),
        400
      ));
    }

    const { identifier } = req.params;
    const updateData = req.body;

    if (!validateBugIdentifier(identifier)) {
      return res.status(400).json(createErrorResponse(
        'Invalid bug identifier format',
        null,
        400
      ));
    }

    // Find the bug
    const bug = await findBugByIdOrBugId(identifier);
    if (!bug) {
      return res.status(404).json(createErrorResponse(
        'Bug not found',
        null,
        404
      ));
    }

    // Prepare update data with standardized types
    const sanitizedUpdateData = {};
    
    if (updateData.title) sanitizedUpdateData.title = updateData.title.trim();
    if (updateData.description) sanitizedUpdateData.description = updateData.description.trim();
    if (updateData.status) sanitizedUpdateData.status = updateData.status;
    if (updateData.priority) sanitizedUpdateData.priority = updateData.priority;
    if (updateData.assignedTo) sanitizedUpdateData.assignedTo = updateData.assignedTo;
    if (updateData.bountyPoints !== undefined) {
      sanitizedUpdateData.bountyPoints = Number(updateData.bountyPoints);
    }

    // Handle status changes
    if (updateData.status === 'resolved' && bug.status !== 'resolved') {
      sanitizedUpdateData.resolvedBy = req.user.id;
      sanitizedUpdateData.resolvedAt = new Date();
      
      // Award points for resolution
      try {
        await awardPointsToUser(req.user.id, 25, 'bug_resolved', bug._id);
      } catch (pointsError) {
        console.error('Error awarding points for bug resolution:', pointsError);
      }
    }

    if (updateData.status === 'closed' && bug.status !== 'closed') {
      sanitizedUpdateData.closedAt = new Date();
    }

    // Update the bug
    const updatedBug = await Bug.findByIdAndUpdate(
      bug._id,
      sanitizedUpdateData,
      { new: true, runValidators: true }
    );

    // Get updated bug with population
    const populatedBug = await getBugWithStandardPopulation(updatedBug._id);
    const standardizedBug = standardizeBugResponse(populatedBug);

    res.json(createSuccessResponse(
      standardizedBug,
      'Bug updated successfully'
    ));

  } catch (error) {
    console.error('Update bug error:', error);
    res.status(500).json(createErrorResponse(
      'Server error while updating bug',
      process.env.NODE_ENV === 'development' ? error.message : null,
      500
    ));
  }
};

/**
 * Delete a bug
 */
const deleteBug = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(createErrorResponse(
        'Validation failed',
        errors.array(),
        400
      ));
    }

    const { identifier } = req.params;

    if (!validateBugIdentifier(identifier)) {
      return res.status(400).json(createErrorResponse(
        'Invalid bug identifier format',
        null,
        400
      ));
    }

    const bug = await findBugByIdOrBugId(identifier);
    if (!bug) {
      return res.status(404).json(createErrorResponse(
        'Bug not found',
        null,
        404
      ));
    }

    // Check if user can delete (only reporter or admin)
    if (bug.reportedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json(createErrorResponse(
        'Not authorized to delete this bug',
        null,
        403
      ));
    }

    await Bug.findByIdAndDelete(bug._id);

    res.json(createSuccessResponse(
      null,
      'Bug deleted successfully'
    ));

  } catch (error) {
    console.error('Delete bug error:', error);
    res.status(500).json(createErrorResponse(
      'Server error while deleting bug',
      process.env.NODE_ENV === 'development' ? error.message : null,
      500
    ));
  }
};

/**
 * Add a comment to a bug
 */
const addComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(createErrorResponse(
        'Validation failed',
        errors.array(),
        400
      ));
    }

    const { identifier } = req.params;
    const { content, isResolutionComment = false } = req.body;

    if (!validateBugIdentifier(identifier)) {
      return res.status(400).json(createErrorResponse(
        'Invalid bug identifier format',
        null,
        400
      ));
    }

    const bug = await findBugByIdOrBugId(identifier);
    if (!bug) {
      return res.status(404).json(createErrorResponse(
        'Bug not found',
        null,
        404
      ));
    }

    const comment = {
      content: content.trim(),
      author: req.user.id,
      isResolutionComment: Boolean(isResolutionComment),
      pointsAwarded: 0,
      createdAt: new Date()
    };

    bug.comments.push(comment);
    await bug.save();

    // Award points for commenting
    try {
      await awardPointsToUser(req.user.id, 5, 'comment_added', bug._id);
      // Update the comment with points awarded
      const lastComment = bug.comments[bug.comments.length - 1];
      lastComment.pointsAwarded = 5;
      await bug.save();
    } catch (pointsError) {
      console.error('Error awarding points for comment:', pointsError);
    }

    // Get updated bug with population
    const populatedBug = await getBugWithStandardPopulation(bug._id);
    const standardizedBug = standardizeBugResponse(populatedBug);

    res.status(201).json(createSuccessResponse(
      standardizedBug,
      'Comment added successfully'
    ));

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json(createErrorResponse(
      'Server error while adding comment',
      process.env.NODE_ENV === 'development' ? error.message : null,
      500
    ));
  }
};

module.exports = {
  getAllBugs,
  getBugById,
  createBug,
  updateBug,
  deleteBug,
  addComment
};