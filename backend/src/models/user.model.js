const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    userType: {
      type: String,
      enum: ['volunteer', 'ngo', 'corporate'],
      required: true,
      default: 'volunteer',
    },
    photoURL: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Profile fields
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    // Volunteer-specific fields
    skills: [{
      type: String,
      trim: true,
    }],
    interests: [{
      type: String,
      trim: true,
    }],
    availability: {
      type: String,
      trim: true,
    },
    // NGO-specific fields
    organizationName: {
      type: String,
      trim: true,
    },
    registrationNumber: {
      type: String,
      trim: true,
    },
    focusAreas: [{
      type: String,
      trim: true,
    }],
    website: {
      type: String,
      trim: true,
    },
    // Corporate-specific fields
    companyName: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    csrInterests: [{
      type: String,
      trim: true,
    }],
    csrBudget: {
      type: String,
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ userType: 1 });
userSchema.index({ location: 1 });
userSchema.index({ skills: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
