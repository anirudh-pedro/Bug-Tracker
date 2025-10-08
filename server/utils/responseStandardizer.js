/**
 * API Response Standardization Utility
 * Ensures consistent data types and formats across all API responses
 */

/**
 * Standardize user reference object
 * @param {Object} user - User object from database
 * @returns {Object} Standardized user reference
 */
const standardizeUserReference = (user) => {
  if (!user) return null;
  
  return {
    id: user._id.toString(),
    name: user.name || '',
    email: user.email || '',
    username: user.username || null,
    avatar: user.avatar || '',
    totalPoints: Number(user.points?.total || 0)
  };
};

/**
 * Standardize points data
 * @param {Object} pointsData - Points data from database
 * @returns {Object} Standardized points object
 */
const standardizePoints = (pointsData) => {
  if (!pointsData) {
    return {
      total: 0,
      earned: 0,
      spent: 0,
      breakdown: {
        bugsReported: 0,
        bugsResolved: 0,
        comments: 0,
        contributions: 0
      }
    };
  }
  
  return {
    total: Number(pointsData.total || 0),
    earned: Number(pointsData.earned || 0),
    spent: Number(pointsData.spent || 0),
    breakdown: {
      bugsReported: Number(pointsData.breakdown?.bugsReported || 0),
      bugsResolved: Number(pointsData.breakdown?.bugsResolved || 0),
      comments: Number(pointsData.breakdown?.comments || 0),
      contributions: Number(pointsData.breakdown?.contributions || 0)
    }
  };
};

/**
 * Standardize date to ISO string
 * @param {Date|string} date - Date to standardize
 * @returns {string|null} ISO date string or null
 */
const standardizeDate = (date) => {
  if (!date) return null;
  
  try {
    const dateObj = new Date(date);
    return dateObj.toISOString();
  } catch (error) {
    console.error('Error standardizing date:', error);
    return null;
  }
};

/**
 * Standardize project reference
 * @param {Object} project - Project object from database
 * @returns {Object} Standardized project reference
 */
const standardizeProjectReference = (project) => {
  if (!project) return null;
  
  return {
    id: project._id.toString(),
    name: project.name || '',
    key: project.key || '',
    description: project.description || ''
  };
};

/**
 * Standardize bug object for API response
 * @param {Object} bug - Bug object from database
 * @returns {Object} Standardized bug object
 */
const standardizeBugResponse = (bug) => {
  if (!bug) return null;
  
  return {
    id: bug._id.toString(),
    bugId: bug.bugId || bug._id.toString(),
    title: bug.title || '',
    description: bug.description || '',
    status: bug.status || 'open',
    priority: bug.priority || 'medium',
    severity: bug.severity || 'minor',
    category: bug.category || 'bug',
    project: standardizeProjectReference(bug.project),
    reportedBy: standardizeUserReference(bug.reportedBy),
    resolvedBy: standardizeUserReference(bug.resolvedBy),
    assignedTo: standardizeUserReference(bug.assignedTo),
    
    // Environment details
    environment: bug.environment ? {
      os: bug.environment.os || '',
      browser: bug.environment.browser || '',
      version: bug.environment.version || '',
      device: bug.environment.device || ''
    } : null,
    
    // Steps and behavior
    stepsToReproduce: bug.stepsToReproduce ? 
      bug.stepsToReproduce
        .sort((a, b) => a.order - b.order)
        .map(step => step.step)
        .join('\n') : null,
    expectedBehavior: bug.expectedResult || null,
    actualBehavior: bug.actualResult || null,
    
    // Repository and attachments  
    repositoryUrl: bug.githubRepo?.url || null,
    attachments: bug.attachments ? bug.attachments.map(attachment => ({
      filename: attachment.filename || '',
      url: attachment.url || '',
      type: attachment.type || '',
      size: Number(attachment.size || 0),
      uploadedAt: standardizeDate(attachment.uploadedAt)
    })) : [],
    
    // Tags and labels
    tags: bug.tags || [],
    labels: bug.labels ? bug.labels.map(label => ({
      name: label.name || '',
      color: label.color || ''
    })) : [],
    
    // GitHub integration
    githubRepo: bug.githubRepo ? {
      url: bug.githubRepo.url || '',
      owner: bug.githubRepo.owner || '',
      name: bug.githubRepo.name || '',
      isPublic: Boolean(bug.githubRepo.isPublic)
    } : null,
    
    bountyPoints: Number(bug.bountyPoints || 0),
    pointsAwarded: bug.pointsAwarded ? bug.pointsAwarded.map(award => ({
      userId: award.userId ? award.userId.toString() : null,
      points: Number(award.points || 0),
      reason: award.reason || '',
      awardedAt: standardizeDate(award.awardedAt),
      awardedBy: award.awardedBy ? award.awardedBy.toString() : null
    })) : [],
    comments: bug.comments ? bug.comments.map(comment => ({
      id: comment._id.toString(),
      content: comment.content || '',
      author: standardizeUserReference(comment.author),
      pointsAwarded: Number(comment.pointsAwarded || 0),
      isResolutionComment: Boolean(comment.isResolutionComment),
      createdAt: standardizeDate(comment.createdAt)
    })) : [],
    createdAt: standardizeDate(bug.createdAt),
    updatedAt: standardizeDate(bug.updatedAt),
    resolvedAt: standardizeDate(bug.resolvedAt),
    closedAt: standardizeDate(bug.closedAt)
  };
};

/**
 * Standardize user stats object
 * @param {Object} stats - User stats from database
 * @returns {Object} Standardized stats object
 */
const standardizeUserStats = (stats) => {
  if (!stats) {
    return {
      totalPoints: 0,
      bugsReported: 0,
      bugsResolved: 0,
      pullRequests: 0,
      projectsCreated: 0,
      activeBugs: 0
    };
  }
  
  return {
    totalPoints: Number(stats.totalPoints || 0),
    bugsReported: Number(stats.bugsReported || 0),
    bugsResolved: Number(stats.bugsResolved || 0),
    pullRequests: Number(stats.pullRequests || 0),
    projectsCreated: Number(stats.projectsCreated || 0),
    activeBugs: Number(stats.activeBugs || 0)
  };
};

/**
 * Standardize leaderboard entry
 * @param {Object} user - User object from leaderboard query
 * @param {number} rank - User's rank position
 * @returns {Object} Standardized leaderboard entry
 */
const standardizeLeaderboardEntry = (user, rank) => {
  return {
    id: user._id.toString(),
    name: user.name || '',
    email: user.email || '',
    username: user.username || null,
    avatar: user.avatar || '',
    points: Number(user.points?.total || 0),
    bugsFixed: Number(user.bugsResolved || 0),
    rank: Number(rank),
    badge: determineBadge(user.points?.total || 0),
    weeklyPoints: Number(Math.floor((user.points?.total || 0) * 0.1)),
    monthlyPoints: Number(Math.floor((user.points?.total || 0) * 0.3)),
    joinedAt: standardizeDate(user.createdAt)
  };
};

/**
 * Determine badge based on points
 * @param {number} points - Total points
 * @returns {string} Badge name
 */
const determineBadge = (points) => {
  if (points >= 1000) return 'Expert';
  if (points >= 500) return 'Advanced';
  if (points >= 200) return 'Intermediate';
  if (points >= 50) return 'Beginner';
  return 'Newcomer';
};

/**
 * Standardize pagination object
 * @param {Object} paginationData - Pagination data
 * @returns {Object} Standardized pagination object
 */
const standardizePagination = (paginationData) => {
  return {
    currentPage: Number(paginationData.currentPage || 1),
    totalPages: Number(paginationData.totalPages || 1),
    totalItems: Number(paginationData.totalItems || paginationData.totalBugs || 0),
    hasNext: Boolean(paginationData.hasNext),
    hasPrev: Boolean(paginationData.hasPrev),
    limit: Number(paginationData.limit || 10)
  };
};

/**
 * Standardize API success response
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Standardized success response
 */
const createSuccessResponse = (data, message = 'Success', metadata = {}) => {
  return {
    success: true,
    message: String(message),
    data: data || null,
    timestamp: new Date().toISOString(),
    ...metadata
  };
};

/**
 * Standardize API error response
 * @param {string} message - Error message
 * @param {Object} details - Error details
 * @param {number} code - Error code
 * @returns {Object} Standardized error response
 */
const createErrorResponse = (message, details = null, code = null) => {
  return {
    success: false,
    message: String(message),
    error: details,
    code: code ? Number(code) : null,
    timestamp: new Date().toISOString()
  };
};

/**
 * Middleware to standardize all API responses
 */
const responseStandardizerMiddleware = (req, res, next) => {
  // Override res.json to standardize responses
  const originalJson = res.json;
  
  res.json = function(data) {
    // If data is already standardized (has success field), pass through
    if (data && typeof data === 'object' && 'success' in data) {
      return originalJson.call(this, data);
    }
    
    // Standardize the response
    const standardizedResponse = createSuccessResponse(data);
    return originalJson.call(this, standardizedResponse);
  };
  
  // Add helper methods to response object
  res.success = function(data, message, metadata) {
    return this.json(createSuccessResponse(data, message, metadata));
  };
  
  res.error = function(message, details, statusCode = 500) {
    this.status(statusCode);
    return this.json(createErrorResponse(message, details, statusCode));
  };
  
  next();
};

module.exports = {
  standardizeUserReference,
  standardizePoints,
  standardizeDate,
  standardizeProjectReference,
  standardizeBugResponse,
  standardizeUserStats,
  standardizeLeaderboardEntry,
  standardizePagination,
  createSuccessResponse,
  createErrorResponse,
  responseStandardizerMiddleware,
  determineBadge
};