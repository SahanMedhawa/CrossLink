const volunteerService = require('../../services/volunteer_management/volunteer.service');

/**
 * GET /api/volunteer/profile
 * Get authenticated volunteer's own profile
 */
const getProfile = async (req, res) => {
  try {
    const profile = await volunteerService.getVolunteerProfile(req.user.id);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error fetching volunteer profile.',
    });
  }
};

/**
 * PUT /api/volunteer/profile
 * Update authenticated volunteer's profile
 */
const updateProfile = async (req, res) => {
  try {
    const updatedProfile = await volunteerService.updateVolunteerProfile(
      req.user.id,
      req.body
    );
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updatedProfile,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error updating volunteer profile.',
    });
  }
};

/**
 * DELETE /api/volunteer/profile
 * Delete authenticated volunteer's account
 */
const deleteProfile = async (req, res) => {
  try {
    const result = await volunteerService.deleteVolunteerProfile(req.user.id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error deleting volunteer profile.',
    });
  }
};

/**
 * GET /api/volunteer/:id
 * Get public (limited) volunteer profile
 */
const getPublicProfile = async (req, res) => {
  try {
    const profile = await volunteerService.getPublicVolunteerProfile(
      req.params.id
    );
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error fetching volunteer profile.',
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
  getPublicProfile,
};
