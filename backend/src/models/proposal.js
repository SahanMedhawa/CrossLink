const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  // --- RELATIONSHIPS ---
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  corporateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assumes User model holds Corporate data
    required: [true, 'Corporate ID is required']
  },
  // Note: ngoId is NOT stored here. It is derived from the Project document.

  // --- PROPOSAL DETAILS ---
  proposalTitle: {
    type: String,
    required: [true, 'Proposal title is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  expectedImpact: {
    type: String,
    required: [true, 'Expected impact is required'],
    maxlength: 500
  },
  message: {
    type: String,
    required: [true, 'Message to NGO is required'],
    maxlength: 1000
  },

     // --- GOOGLE MAPS LOCATION ---
  deliveryLocation: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },

  // --- OPTIONS ---
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  documentUrl: {
    type: String,
    default: null // For future file upload implementation
  },

  // --- STATUS WORKFLOW ---
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
    default: 'Pending'
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Create a geospatial index for map queries (Required for MongoDB Map view)
proposalSchema.index({ 'deliveryLocation.coordinates': '2dsphere' });

module.exports = mongoose.model('Proposal', proposalSchema);