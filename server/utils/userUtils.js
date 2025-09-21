const User = require('../models/User');

/**
 * Find user by either MongoDB _id or Firebase googleId
 * This standardizes user identification across the system
 * @param {string} identifier - Either MongoDB _id or Firebase googleId
 * @returns {Object|null} User object or null if not found
 */
const findUserByIdOrGoogleId = async (identifier) => {
  try {
    // First try to find by MongoDB _id
    let user = await User.findById(identifier).catch(() => null);
    
    // If not found by _id, try to find by googleId (Firebase UID)
    if (!user) {
      user = await User.findOne({ googleId: identifier });
    }
    
    return user;
  } catch (error) {
    console.error('Error finding user by ID or GoogleId:', error);
    return null;
  }
};

/**
 * Get user statistics with proper ID handling
 * @param {string} identifier - Either MongoDB _id or Firebase googleId
 * @returns {Object} User stats object
 */
const getUserStats = async (identifier) => {
  try {
    const user = await findUserByIdOrGoogleId(identifier);
    if (!user) {
      throw new Error('User not found');
    }

    const Bug = require('../models/Bug');
    const Project = require('../models/Project');
    
    // Get bug statistics using the correct user ID
    const [bugsReported, bugsResolved, pullRequests, projectsCreated, activeBugs] = await Promise.all([
      Bug.countDocuments({ reportedBy: user._id }),
      Bug.countDocuments({ resolvedBy: user._id }),
      Bug.aggregate([
        { $match: { 'pullRequests.author.userId': user._id } },
        { $unwind: '$pullRequests' },
        { $match: { 'pullRequests.author.userId': user._id } },
        { $count: 'total' }
      ]),
      Project.countDocuments({ owner: user._id }),
      Bug.countDocuments({ reportedBy: user._id, status: { $in: ['open', 'in-progress'] } })
    ]);

    return {
      user,
      stats: {
        totalPoints: user.points?.total || 0,
        bugsReported: bugsReported || 0,
        bugsResolved: bugsResolved || 0,
        pullRequests: pullRequests[0]?.total || 0,
        projectsCreated: projectsCreated || 0,
        activeBugs: activeBugs || 0
      }
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

/**
 * Validate and normalize user identifier
 * @param {string} identifier - User identifier
 * @returns {Object} Validation result with normalized ID
 */
const validateUserIdentifier = (identifier) => {
  if (!identifier) {
    return { valid: false, error: 'User identifier is required' };
  }

  // Check if it's a valid MongoDB ObjectId format
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(identifier);
  
  // Check if it's a Firebase UID format (28 characters alphanumeric)
  const isFirebaseId = /^[a-zA-Z0-9]{28}$/.test(identifier);
  
  if (!isMongoId && !isFirebaseId) {
    return { valid: false, error: 'Invalid user identifier format' };
  }

  return { 
    valid: true, 
    identifier: identifier.trim(),
    type: isMongoId ? 'mongodb' : 'firebase'
  };
};

module.exports = {
  findUserByIdOrGoogleId,
  getUserStats,
  validateUserIdentifier
};