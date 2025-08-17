const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
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

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

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
