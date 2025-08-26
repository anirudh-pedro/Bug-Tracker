const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Bug title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Bug description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  // Bug identification
  bugId: {
    type: String,
    unique: true,
    sparse: true
  },
  // Project and assignment
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Legacy field mapping for backward compatibility
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Bug classification
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  severity: {
    type: String,
    enum: ['trivial', 'minor', 'major', 'critical', 'blocker'],
    default: 'minor'
  },
  category: {
    type: String,
    enum: ['bug', 'feature', 'improvement', 'task', 'story'],
    default: 'bug'
  },
  // Bug status
  status: {
    type: String,
    enum: ['open', 'in-progress', 'testing', 'resolved', 'closed', 'rejected'],
    default: 'open'
  },
  resolution: {
    type: String,
    enum: ['', 'fixed', 'wont-fix', 'duplicate', 'invalid', 'works-as-designed'],
    default: ''
  },
  // Environment and technical details
  environment: {
    os: String,
    browser: String,
    version: String,
    device: String
  },
  stepsToReproduce: [{
    step: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      required: true
    }
  }],
  expectedResult: {
    type: String,
    maxlength: [500, 'Expected result cannot exceed 500 characters']
  },
  actualResult: {
    type: String,
    maxlength: [500, 'Actual result cannot exceed 500 characters']
  },
  // Attachments and links
  attachments: [{
    filename: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Tags and labels
  tags: [{
    type: String,
    trim: true
  }],
  labels: [{
    name: String,
    color: String
  }],
  // Time tracking
  estimatedTime: {
    type: Number, // in hours
    min: 0
  },
  actualTime: {
    type: Number, // in hours
    min: 0,
    default: 0
  },
  // Dates
  dueDate: Date,
  resolvedAt: Date,
  closedAt: Date,
  // Comments and activity
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    attachments: [{
      filename: String,
      url: String
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Activity log
  activity: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: {
      type: String,
      required: true
    },
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Watchers
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Duplicate tracking
  duplicates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bug'
  }],
  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bug'
  }
}, {
  timestamps: true
});

// Indexes for better performance (bugId already has unique index, so skip manual index)
bugSchema.index({ project: 1 });
bugSchema.index({ reporter: 1 });
bugSchema.index({ assignee: 1 });
bugSchema.index({ reportedBy: 1 });
bugSchema.index({ assignedTo: 1 });
bugSchema.index({ status: 1 });
bugSchema.index({ priority: 1 });
bugSchema.index({ createdAt: -1 });
bugSchema.index({ 'project': 1, 'status': 1 });

// Generate bug ID before saving
bugSchema.pre('save', async function(next) {
  if (this.isNew && !this.bugId) {
    try {
      // Get project to use its key
      const Project = mongoose.model('Project');
      const project = await Project.findById(this.project);
      
      if (project) {
        // Find the highest bug number for this project
        const lastBug = await this.constructor
          .findOne({ project: this.project })
          .sort({ createdAt: -1 })
          .select('bugId');
        
        let bugNumber = 1;
        if (lastBug && lastBug.bugId) {
          const match = lastBug.bugId.match(/-(\d+)$/);
          if (match) {
            bugNumber = parseInt(match[1]) + 1;
          }
        }
        
        this.bugId = `${project.key}-${bugNumber.toString().padStart(3, '0')}`;
      }
    } catch (error) {
      console.error('Error generating bug ID:', error);
    }
  }
  next();
});

// Middleware to track status changes
bugSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    if (this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = now;
    } else if (this.status === 'closed' && !this.closedAt) {
      this.closedAt = now;
    }
  }
  next();
});

// Method to add comment
bugSchema.methods.addComment = function(userId, content, attachments = []) {
  this.comments.push({
    author: userId,
    content: content,
    attachments: attachments,
    createdAt: new Date()
  });
  return this;
};

// Method to add activity
bugSchema.methods.addActivity = function(userId, action, field = null, oldValue = null, newValue = null) {
  this.activity.push({
    user: userId,
    action: action,
    field: field,
    oldValue: oldValue,
    newValue: newValue,
    timestamp: new Date()
  });
  return this;
};

// Method to add watcher
bugSchema.methods.addWatcher = function(userId) {
  if (!this.watchers.includes(userId)) {
    this.watchers.push(userId);
  }
  return this;
};

// Method to remove watcher
bugSchema.methods.removeWatcher = function(userId) {
  this.watchers = this.watchers.filter(watcher => watcher.toString() !== userId.toString());
  return this;
};

// Static method to find bugs by user
bugSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [
      { reporter: userId },
      { assignee: userId },
      { watchers: userId }
    ]
  });
};

// Static method to get bug statistics
bugSchema.statics.getStatistics = async function(projectId = null) {
  const match = projectId ? { project: projectId } : {};
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
        critical: { $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    critical: 0,
    high: 0
  };
};

// Virtual for age in days
bugSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Bug', bugSchema);
