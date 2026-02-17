const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizationName: {
    type: String,
    required: true
  },
  skills: [{
    type: String,
    required: true
  }],
  focusArea: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'active'
  },
  image: {
    type: String,
    default: ''
  },
  resources: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    description: {
      type: String,
      default: ''
    }
  }]
}, {
  timestamps: true
});

// Index for faster querying
projectSchema.index({ ngoId: 1, status: 1 });
projectSchema.index({ skills: 1 });
projectSchema.index({ focusArea: 1 });

module.exports = mongoose.model('Project', projectSchema);