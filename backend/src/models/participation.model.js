const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema(
  {
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'completed'],
      default: 'requested',
    },
    message: {
      type: String,
      required: [true, 'Motivation message is required.'],
      trim: true,
      minlength: [10, 'Motivation message must be at least 10 characters.'],
      maxlength: [1000, 'Motivation message cannot exceed 1000 characters.'],
    },
    experienceSummary: {
      type: String,
      required: [true, 'Relevant experience is required.'],
      trim: true,
      minlength: [10, 'Experience summary must be at least 10 characters.'],
      maxlength: [1000, 'Experience summary cannot exceed 1000 characters.'],
    },
    availabilityConfirmed: {
      type: Boolean,
      required: [true, 'Availability confirmation is required.'],
      default: false,
    },
    preferredRole: {
      type: String,
      trim: true,
      maxlength: [100, 'Preferred role cannot exceed 100 characters.'],
    },
    expectedHours: {
      type: Number,
      min: [1, 'Expected hours must be at least 1.'],
      max: [500, 'Expected hours cannot exceed 500.'],
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index — one volunteer can only apply once per project
participationSchema.index({ volunteerId: 1, projectId: 1 }, { unique: true });

// Fast lookup: all volunteers for a project filtered by status
participationSchema.index({ projectId: 1, status: 1 });

// Fast lookup: all applications by a volunteer filtered by status
participationSchema.index({ volunteerId: 1, status: 1 });

// Fast lookup: all participations managed by an NGO
participationSchema.index({ ngoId: 1, status: 1 });

module.exports = mongoose.model('Participation', participationSchema);
