const Bug = require('../models/Bug');

/**
 * Find bug by either MongoDB _id or custom bugId field
 * This standardizes bug identification across the system
 * @param {string} identifier - Either MongoDB _id or custom bugId
 * @returns {Object|null} Bug object or null if not found
 */
const findBugByIdOrBugId = async (identifier) => {
  try {
    console.log('🔍 findBugByIdOrBugId called with:', identifier);
    
    // First try to find by MongoDB _id
    console.log('🔍 Trying to find by MongoDB _id...');
    let bug = await Bug.findById(identifier).catch((err) => {
      console.log('❌ findById failed:', err.message);
      return null;
    });
    
    if (bug) {
      console.log('✅ Found bug by MongoDB _id:', bug._id);
      return bug;
    }
    
    // If not found by _id, try to find by bugId field
    console.log('🔍 Not found by _id, trying by bugId field...');
    bug = await Bug.findOne({ bugId: identifier });
    
    if (bug) {
      console.log('✅ Found bug by bugId:', bug.bugId);
    } else {
      console.log('❌ Bug not found by either _id or bugId');
    }
    
    return bug;
  } catch (error) {
    console.error('❌ Error finding bug by ID or BugId:', error);
    return null;
  }
};

/**
 * Find bug by identifier with population
 * @param {string} identifier - Either MongoDB _id or custom bugId
 * @param {string|Array} populateFields - Fields to populate
 * @returns {Object|null} Populated bug object or null if not found
 */
const findBugByIdOrBugIdWithPopulation = async (identifier, populateFields = []) => {
  try {
    let bug = null;
    
    // Try MongoDB _id first
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      bug = await Bug.findById(identifier);
    }
    
    // If not found by _id or not valid ObjectId, try bugId
    if (!bug) {
      bug = await Bug.findOne({ bugId: identifier });
    }
    
    // Apply population if bug found
    if (bug && populateFields.length > 0) {
      for (const field of populateFields) {
        if (typeof field === 'string') {
          bug = await bug.populate(field);
        } else if (typeof field === 'object') {
          bug = await bug.populate(field.path, field.select);
        }
      }
    }
    
    return bug;
  } catch (error) {
    console.error('Error finding and populating bug:', error);
    return null;
  }
};

/**
 * Validate bug identifier format
 * @param {string|ObjectId} identifier - Bug identifier
 * @returns {Object} Validation result
 */
const validateBugIdentifier = (identifier) => {
  if (!identifier) {
    return { valid: false, error: 'Bug identifier is required' };
  }

  // Convert to string if it's not already
  const identifierStr = typeof identifier === 'string' ? identifier : identifier.toString();
  
  // Trim whitespace
  const trimmedIdentifier = identifierStr.trim();

  // Check if it's a valid MongoDB ObjectId format
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(trimmedIdentifier);
  
  // Check if it's a custom bugId format (PROJECT-NUMBER, e.g., "PROJ-001" or "BUG-123456")
  const isBugId = /^[A-Z]+[A-Z0-9]*-[0-9]+$/.test(trimmedIdentifier);
  
  if (!isMongoId && !isBugId) {
    return { valid: false, error: 'Invalid bug identifier format' };
  }

  return { 
    valid: true, 
    identifier: trimmedIdentifier,
    type: isMongoId ? 'mongodb' : 'bugId'
  };
};

/**
 * Standard bug population configuration
 */
const standardBugPopulation = [
  { path: 'project', select: 'name description key' },
  { path: 'reportedBy', select: 'name email username' },
  { path: 'resolvedBy', select: 'name email username' },
  { path: 'assignedTo', select: 'name email username' },
  { path: 'comments.author', select: 'name email username _id' }
];

/**
 * Get bug with standard population
 * @param {string} identifier - Bug identifier  
 * @returns {Object|null} Fully populated bug or null
 */
const getBugWithStandardPopulation = async (identifier) => {
  try {
    const validation = validateBugIdentifier(identifier);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    let bug = null;
    
    if (validation.type === 'mongodb') {
      bug = await Bug.findById(identifier);
    } else {
      bug = await Bug.findOne({ bugId: identifier });
    }
    
    if (!bug) {
      return null;
    }

    // Apply standard population
    for (const populateConfig of standardBugPopulation) {
      bug = await bug.populate(populateConfig.path, populateConfig.select);
    }
    
    return bug;
  } catch (error) {
    console.error('Error getting bug with standard population:', error);
    return null;
  }
};

module.exports = {
  findBugByIdOrBugId,
  findBugByIdOrBugIdWithPopulation,
  validateBugIdentifier,
  standardBugPopulation,
  getBugWithStandardPopulation
};