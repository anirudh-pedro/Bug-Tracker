const mongoose = require('mongoose');
const User = require('../models/User');
const Bug = require('../models/Bug');

/**
 * Award points to a user with proper transaction handling
 * This ensures atomicity and prevents duplicate point awards
 * @param {string} userId - User ID to award points to
 * @param {number} points - Points to award  
 * @param {string} reason - Reason for awarding points
 * @param {string} bugId - Related bug ID (optional)
 * @param {Object} metadata - Additional metadata (optional)
 * @returns {Promise<Object>} Transaction result
 */
const awardPointsToUser = async (userId, points, reason, bugId = null, metadata = {}) => {
  const session = await mongoose.startSession();
  
  try {
    let result;
    
    await session.withTransaction(async () => {
      // Find user and validate
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate points
      if (!Number.isInteger(points) || points <= 0) {
        throw new Error('Points must be a positive integer');
      }

      // Check for duplicate point award (if bugId provided)
      if (bugId) {
        const existingAward = await Bug.findOne({
          _id: bugId,
          'pointsAwarded.userId': userId
        }).session(session);
        
        if (existingAward) {
          throw new Error('Points already awarded to this user for this bug');
        }
      }

      // Initialize points object if it doesn't exist
      if (!user.points) {
        user.points = {
          total: 0,
          breakdown: {
            bugsReported: 0,
            bugsResolved: 0,
            comments: 0,
            contributions: 0
          }
        };
      }

      // Update user points
      const oldTotal = user.points.total || 0;
      user.points.total = oldTotal + points;
      
      // Update breakdown based on reason
      switch (reason) {
        case 'bug_reported':
          user.points.breakdown.bugsReported = (user.points.breakdown.bugsReported || 0) + points;
          break;
        case 'bug_resolved':
          user.points.breakdown.bugsResolved = (user.points.breakdown.bugsResolved || 0) + points;
          break;
        case 'comment_helpful':
          user.points.breakdown.comments = (user.points.breakdown.comments || 0) + points;
          break;
        case 'contribution':
          user.points.breakdown.contributions = (user.points.breakdown.contributions || 0) + points;
          break;
        default:
          // For custom reasons, add to contributions
          user.points.breakdown.contributions = (user.points.breakdown.contributions || 0) + points;
      }

      // Add points history entry
      if (!user.pointsHistory) {
        user.pointsHistory = [];
      }
      
      user.pointsHistory.push({
        points: points,
        reason: reason,
        bugId: bugId,
        metadata: metadata,
        awardedAt: new Date(),
        previousTotal: oldTotal,
        newTotal: user.points.total
      });

      // Save user
      await user.save({ session });

      // Update bug if bugId provided
      if (bugId) {
        await Bug.findByIdAndUpdate(
          bugId,
          {
            $push: {
              pointsAwarded: {
                userId: userId,
                points: points,
                reason: reason,
                awardedAt: new Date(),
                awardedBy: metadata.awardedBy || null
              }
            }
          },
          { session }
        );
      }

      result = {
        success: true,
        userId: userId,
        pointsAwarded: points,
        newTotal: user.points.total,
        reason: reason,
        bugId: bugId
      };
    });

    return result;
    
  } catch (error) {
    console.error('Error awarding points:', error);
    throw error;
  } finally {
    await session.endSession();
  }
};

/**
 * Bulk award points to multiple users atomically
 * @param {Array} awards - Array of award objects {userId, points, reason, bugId, metadata}
 * @returns {Promise<Object>} Bulk operation result
 */
const bulkAwardPoints = async (awards) => {
  const session = await mongoose.startSession();
  
  try {
    let results = [];
    
    await session.withTransaction(async () => {
      for (const award of awards) {
        const { userId, points, reason, bugId, metadata } = award;
        
        // Validate award
        if (!userId || !points || !reason) {
          throw new Error(`Invalid award data: ${JSON.stringify(award)}`);
        }

        // Award points to this user
        const result = await awardPointsToUser(userId, points, reason, bugId, metadata);
        results.push(result);
      }
    });

    return {
      success: true,
      awardsProcessed: results.length,
      results: results
    };
    
  } catch (error) {
    console.error('Error in bulk point award:', error);
    throw error;
  } finally {
    await session.endSession();
  }
};

/**
 * Deduct points from a user with transaction handling
 * @param {string} userId - User ID
 * @param {number} points - Points to deduct
 * @param {string} reason - Reason for deduction
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Transaction result
 */
const deductPointsFromUser = async (userId, points, reason, metadata = {}) => {
  const session = await mongoose.startSession();
  
  try {
    let result;
    
    await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.points || user.points.total < points) {
        throw new Error('Insufficient points for deduction');
      }

      const oldTotal = user.points.total;
      user.points.total = oldTotal - points;

      // Add to points history
      if (!user.pointsHistory) {
        user.pointsHistory = [];
      }
      
      user.pointsHistory.push({
        points: -points,
        reason: reason,
        metadata: metadata,
        awardedAt: new Date(),
        previousTotal: oldTotal,
        newTotal: user.points.total
      });

      await user.save({ session });

      result = {
        success: true,
        userId: userId,
        pointsDeducted: points,
        newTotal: user.points.total,
        reason: reason
      };
    });

    return result;
    
  } catch (error) {
    console.error('Error deducting points:', error);
    throw error;
  } finally {
    await session.endSession();
  }
};

/**
 * Get user's points history with pagination
 * @param {string} userId - User ID
 * @param {number} limit - Number of records to return
 * @param {number} skip - Number of records to skip
 * @returns {Promise<Array>} Points history
 */
const getUserPointsHistory = async (userId, limit = 20, skip = 0) => {
  try {
    const user = await User.findById(userId).select('pointsHistory points');
    if (!user) {
      throw new Error('User not found');
    }

    const history = user.pointsHistory || [];
    const sortedHistory = history
      .sort((a, b) => new Date(b.awardedAt) - new Date(a.awardedAt))
      .slice(skip, skip + limit);

    return {
      success: true,
      currentTotal: user.points?.total || 0,
      history: sortedHistory,
      totalRecords: history.length
    };
  } catch (error) {
    console.error('Error getting points history:', error);
    throw error;
  }
};

module.exports = {
  awardPointsToUser,
  bulkAwardPoints,
  deductPointsFromUser,
  getUserPointsHistory
};