const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
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
        corporateId: mongoose.Schema.Types.ObjectId,
        quantity: Number,
        donatedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);
