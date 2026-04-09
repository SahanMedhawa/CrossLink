const mongoose = require('mongoose');

const fundingSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  corporateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Corporate ID is required']
  },
  // NGO ID is derived from Project -> ngoId

  fundingTitle: {
    type: String,
    required: [true, 'Funding title is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  fundingType: {
    type: String,
    enum: ['Cash', 'In-Kind', 'Resource'],
    required: [true, 'Funding type is required']
  },
  paymentMethod: {
    type: String,
    enum: ['Bank Transfer', 'Check', 'Online Payment', 'Other'],
    required: [true, 'Payment method is required']
  },

    transactionRefId: {
    type: String,
    trim: true,
    default: null
  },
  
  note: {
    type: String,
    maxlength: 500,
    default: ''
  },
  receiptUrl: {
    type: String,
    default: null // Reserved for future file upload of proof (if required by corporate partners)
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed'],
    default: 'Confirmed' // Usually funding is instant, but 'Pending' works if verification needed
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Funding', fundingSchema);