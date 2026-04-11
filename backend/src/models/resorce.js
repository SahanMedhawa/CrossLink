const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    totalQuantity: {
      type: Number,
      required: true
    },
    remainingQuantity: {
      type: Number,
      required: true
    },
    description: String,
    donatedBy: [
      {
        corporateId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        quantity: Number,
        donatedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);
