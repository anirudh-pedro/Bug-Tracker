const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  key: {
    type: String,
    required: [true, 'Project key is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [2, 'Project key must be at least 2 characters'],
    maxlength: [10, 'Project key cannot exceed 10 characters'],
    match: [/^[A-Z0-9]+$/, 'Project key must contain only uppercase letters and numbers']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed', 'archived'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  // Team members
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['developer', 'tester', 'manager', 'viewer'],
      default: 'developer'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Project settings
  settings: {
    allowPublicView: {
      type: Boolean,
      default: false
    },
    autoAssignBugs: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    }
  },
  // Statistics
  stats: {
    totalBugs: {
      type: Number,
      default: 0
    },
    openBugs: {
      type: Number,
      default: 0
    },
    inProgressBugs: {
      type: Number,
      default: 0
    },
    resolvedBugs: {
      type: Number,
      default: 0
    },
    closedBugs: {
      type: Number,
      default: 0
    }
  },
  // Repository information
  repository: {
    url: String,
    branch: {
      type: String,
      default: 'main'
    }
  },
  // Tags and categories
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['web', 'mobile', 'api', 'desktop', 'other'],
    default: 'web'
  }
}, {
  timestamps: true
});

// Indexes for better performance
projectSchema.index({ key: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ createdAt: -1 });

// Virtual for bug count
projectSchema.virtual('bugCount', {
  ref: 'Bug',
  localField: '_id',
  foreignField: 'project',
  count: true
});

// Method to add member to project
projectSchema.methods.addMember = function(userId, role = 'developer') {
  const exists = this.members.find(member => member.user.toString() === userId.toString());
  if (!exists) {
    this.members.push({
      user: userId,
      role: role,
      joinedAt: new Date()
    });
  }
  return this;
};

// Method to remove member from project
projectSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => member.user.toString() !== userId.toString());
  return this;
};

// Method to check if user is member
projectSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString()) || 
         this.owner.toString() === userId.toString();
};

// Method to get member role
projectSchema.methods.getMemberRole = function(userId) {
  if (this.owner.toString() === userId.toString()) {
    return 'owner';
  }
  const member = this.members.find(member => member.user.toString() === userId.toString());
  return member ? member.role : null;
};

// Static method to find projects by user
projectSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [
      { owner: userId },
      { 'members.user': userId }
    ]
  });
};

// Pre-save middleware to generate project key if not provided
projectSchema.pre('save', function(next) {
  if (!this.key && this.name) {
    // Generate key from name (first 3-4 letters, uppercase)
    this.key = this.name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(' ')
      .map(word => word.substring(0, 2))
      .join('')
      .toUpperCase()
      .substring(0, 6);
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
