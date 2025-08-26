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

module.exports = mongoose.model('User', userSchema);
