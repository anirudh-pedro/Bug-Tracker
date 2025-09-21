const mongoose = require('mongoose');

// Counter schema for atomic bug ID generation
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

/**
 * Generate unique bug ID atomically using MongoDB's findOneAndUpdate
 * This prevents race conditions when multiple bugs are created simultaneously
 * @param {string} projectKey - Project key (e.g., "PROJ")
 * @returns {Promise<string>} Unique bug ID (e.g., "PROJ-001")
 */
const generateBugId = async (projectKey) => {
  try {
    if (!projectKey) {
      // If no project, use default counter
      projectKey = 'DEFAULT';
    }

    const counterId = `bug_${projectKey}`;
    
    // Atomically increment counter and get new value
    const counter = await Counter.findOneAndUpdate(
      { _id: counterId },
      { $inc: { seq: 1 } },
      { 
        new: true, 
        upsert: true // Create if doesn't exist
      }
    );

    // Format bug ID with zero-padding
    const bugNumber = counter.seq.toString().padStart(3, '0');
    return `${projectKey}-${bugNumber}`;
    
  } catch (error) {
    console.error('Error generating atomic bug ID:', error);
    
    // Fallback to timestamp-based ID if counter fails
    const timestamp = Date.now().toString().slice(-6);
    return `${projectKey || 'DEFAULT'}-${timestamp}`;
  }
};

/**
 * Reset counter for a specific project (useful for testing)
 * @param {string} projectKey - Project key to reset
 * @returns {Promise<void>}
 */
const resetBugCounter = async (projectKey) => {
  try {
    const counterId = `bug_${projectKey}`;
    await Counter.findOneAndUpdate(
      { _id: counterId },
      { seq: 0 },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error resetting bug counter:', error);
  }
};

/**
 * Get current counter value for a project
 * @param {string} projectKey - Project key
 * @returns {Promise<number>} Current counter value
 */
const getBugCounter = async (projectKey) => {
  try {
    const counterId = `bug_${projectKey}`;
    const counter = await Counter.findById(counterId);
    return counter ? counter.seq : 0;
  } catch (error) {
    console.error('Error getting bug counter:', error);
    return 0;
  }
};

module.exports = {
  Counter,
  generateBugId,
  resetBugCounter,
  getBugCounter
};