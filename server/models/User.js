const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but ensure uniqueness when provided
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  googleId: {
    type: String,
    required: [true, 'Google ID is required'],
    unique: true
  },
  avatar: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function(v) {
        // Allow empty phone number or validate 10 digits
        return !v || /^\d{10}$/.test(v);
      },
      message: 'Phone number must be exactly 10 digits'
    },
    default: ''
  },
  githubUrl: {
    type: String,
    validate: {
      validator: function(v) {
        // Allow empty GitHub URL or validate proper GitHub URL format
        return !v || /^https:\/\/github\.com\/[a-zA-Z0-9\-_]+\/?$/.test(v);
      },
      message: 'GitHub URL must be a valid GitHub profile URL (e.g., https://github.com/username)'
    },
    default: ''
  },
  industry: {
    type: String,
    enum: {
      values: ['', 'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Consulting', 'Real Estate', 'Media & Entertainment', 'Non-Profit', 'Government', 'Other'],
      message: 'Invalid industry selection'
    },
    default: ''
  },
  isFirstTimeUser: {
    type: Boolean,
    default: true
  },
  hasCompletedOnboarding: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'manager', 'developer', 'tester'],
      message: 'Role must be admin, manager, developer, or tester'
    },
    default: 'developer'
  },
  department: {
    type: String,
    default: 'Development',
    maxlength: [50, 'Department cannot exceed 50 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      bugAssigned: {
        type: Boolean,
        default: true
      },
      bugStatusChanged: {
        type: Boolean,
        default: true
      },
      projectUpdates: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  
  // GitHub Integration
  githubProfile: {
    username: String,
    url: String,
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date
  },
  
  // Points and Achievements System
  points: {
    total: {
      type: Number,
      default: 0,
      min: 0
    },
    earned: {
      type: Number,
      default: 0,
      min: 0
    },
    spent: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  achievements: [{
    type: {
      type: String,
      enum: ['bug_reporter', 'bug_solver', 'contributor', 'reviewer', 'mentor']
    },
    level: {
      type: Number,
      min: 1,
      max: 10
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  statistics: {
    bugsReported: {
      type: Number,
      default: 0
    },
    bugsResolved: {
      type: Number,
      default: 0
    },
    pullRequestsSubmitted: {
      type: Number,
      default: 0
    },
    pullRequestsMerged: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.googleId;
      return ret;
    }
  }
});

// Index for better query performance (only add indexes that aren't already created by unique: true)
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
// Note: username index is automatically created by unique: true

// Update lastLogin on authentication
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Get user's active projects
userSchema.methods.getActiveProjects = function() {
  return mongoose.model('Project').find({
    $or: [
      { owner: this._id },
      { members: this._id }
    ],
    status: { $ne: 'archived' }
  });
};

// Get user's assigned bugs
userSchema.methods.getAssignedBugs = function() {
  return mongoose.model('Bug').find({
    assignedTo: this._id,
    status: { $nin: ['closed', 'resolved'] }
  });
};

// Points management methods
userSchema.methods.addPoints = function(amount, source = 'general') {
  this.points.earned += amount;
  this.points.total = this.points.earned - this.points.spent;
  
  // Track statistics based on source
  if (source === 'bug_resolved') {
    this.statistics.bugsResolved += 1;
  } else if (source === 'pr_merged') {
    this.statistics.pullRequestsMerged += 1;
  }
  
  return this.save();
};

userSchema.methods.spendPoints = function(amount) {
  if (this.points.total < amount) {
    throw new Error('Insufficient points');
  }
  this.points.spent += amount;
  this.points.total = this.points.earned - this.points.spent;
  return this.save();
};

userSchema.methods.verifyGithubProfile = function(githubUsername, githubUrl) {
  this.githubProfile.username = githubUsername;
  this.githubProfile.url = githubUrl;
  this.githubProfile.isVerified = true;
  this.githubProfile.verifiedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
