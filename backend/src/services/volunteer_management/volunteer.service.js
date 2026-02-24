const User = require('../../models/user.model');

// Allowed fields that volunteers can update (whitelist to prevent privilege escalation)
const ALLOWED_UPDATE_FIELDS = [
  'name',
  'phone',
  'location',
  'bio',
  'photoURL',
  'skills',
  'interests',
  'availability',
  'coordinates',
];

/**
 * Get full volunteer profile by userId
 */
const getVolunteerProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw { status: 404, message: 'Volunteer not found.' };
  }
  if (user.userType !== 'volunteer') {
    throw { status: 403, message: 'User is not a volunteer.' };
  }
  return user;
};

/**
 * Update volunteer profile with whitelisted fields only
 */
const updateVolunteerProfile = async (userId, updates) => {
  // Sanitize: only allow whitelisted fields
  const sanitizedUpdates = {};
  for (const key of ALLOWED_UPDATE_FIELDS) {
    if (updates[key] !== undefined) {
      sanitizedUpdates[key] = updates[key];
    }
  }

  // Validate skills must be an array if provided
  if (sanitizedUpdates.skills && !Array.isArray(sanitizedUpdates.skills)) {
    throw { status: 400, message: 'Skills must be an array.' };
  }

  // Validate interests must be an array if provided
  if (sanitizedUpdates.interests && !Array.isArray(sanitizedUpdates.interests)) {
    throw { status: 400, message: 'Interests must be an array.' };
  }

  // Validate coordinates format if provided
  if (sanitizedUpdates.coordinates) {
    const { coordinates } = sanitizedUpdates;
    if (
      !coordinates.type ||
      coordinates.type !== 'Point' ||
      !Array.isArray(coordinates.coordinates) ||
      coordinates.coordinates.length !== 2
    ) {
      throw {
        status: 400,
        message: 'Coordinates must be a GeoJSON Point with [longitude, latitude].',
      };
    }
  }

  const user = await User.findByIdAndUpdate(userId, sanitizedUpdates, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) {
    throw { status: 404, message: 'Volunteer not found.' };
  }

  return user;
};

/**
 * Delete volunteer account
 */
const deleteVolunteerProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw { status: 404, message: 'Volunteer not found.' };
  }
  if (user.userType !== 'volunteer') {
    throw { status: 403, message: 'User is not a volunteer.' };
  }
  await User.findByIdAndDelete(userId);
  return { message: 'Volunteer account deleted successfully.' };
};

/**
 * Get public (limited) volunteer profile by ID
 */
const getPublicVolunteerProfile = async (volunteerId) => {
  const user = await User.findById(volunteerId).select(
    'name skills interests availability location bio photoURL userType projectsJoinedCount impactPoints'
  );

  if (!user) {
    throw { status: 404, message: 'Volunteer not found.' };
  }

  if (user.userType !== 'volunteer') {
    throw { status: 404, message: 'User is not a volunteer.' };
  }

  return user;
};

module.exports = {
  getVolunteerProfile,
  updateVolunteerProfile,
  deleteVolunteerProfile,
  getPublicVolunteerProfile,
};
