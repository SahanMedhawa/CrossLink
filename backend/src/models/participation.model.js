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
