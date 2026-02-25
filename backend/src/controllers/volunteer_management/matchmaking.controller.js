const matchmakingService = require('../../services/volunteer_management/matchmaking.service');

/**
 * GET /api/matchmaking/projects
 * Get matched projects for the authenticated volunteer
 * Returns projects ranked by skill-intersection match score
 */
const getMatchedProjects = async (req, res) => {
  try {
    const matches = await matchmakingService.getMatchedProjects(req.user.id);
    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error fetching matched projects.',
    });
  }
};

module.exports = {
  getMatchedProjects,
};
