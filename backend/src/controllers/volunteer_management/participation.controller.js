const participationService = require('../../services/volunteer_management/participation.service');

/**
 * POST /api/participation/request
 * Volunteer requests participation in a project
 * Body: { projectId }
 */
const requestParticipation = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'projectId is required.',
      });
    }

    const participation = await participationService.requestParticipation(
      req.user.id,
      projectId
    );

    res.status(201).json({
      success: true,
      message: 'Participation request submitted successfully.',
      data: participation,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error requesting participation.',
    });
  }
};

/**
 * PATCH /api/participation/:id/status
 * NGO approves/rejects/completes a participation request
 * Body: { status }
 */
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'status is required.',
      });
    }

    const participation = await participationService.updateParticipationStatus(
      req.params.id,
      req.user.id,
      status
    );

    res.status(200).json({
      success: true,
      message: `Participation ${status} successfully.`,
      data: participation,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error updating participation status.',
    });
  }
};

/**
 * GET /api/participation/my-applications
 * Volunteer views their own participation records
 * Query: ?status=requested|approved|rejected|completed
 */
const getMyApplications = async (req, res) => {
  try {
    const applications = await participationService.getVolunteerApplications(
      req.user.id,
      req.query.status
    );

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error fetching applications.',
    });
  }
};

/**
 * GET /api/participation/projects/:projectId/volunteers
 * NGO views all volunteer requests for a specific project
 */
const getProjectVolunteers = async (req, res) => {
  try {
    const volunteers = await participationService.getProjectVolunteers(
      req.params.projectId,
      req.user.id
    );

    res.status(200).json({
      success: true,
      count: volunteers.length,
      data: volunteers,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error fetching project volunteers.',
    });
  }
};

/**
 * GET /api/participation/stats
 * Volunteer dashboard stats (counts)
 */
const getStats = async (req, res) => {
  try {
    const stats = await participationService.getVolunteerStats(req.user.id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error fetching stats.',
    });
  }
};

/**
 * GET /api/participation/ngo/projects
 * NGO views all their projects with volunteer request counts
 */
const getNgoProjectsWithVolunteers = async (req, res) => {
  try {
    const projects =
      await participationService.getNgoProjectsWithVolunteerCounts(req.user.id);

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error fetching projects with volunteer data.',
    });
  }
};

module.exports = {
  requestParticipation,
  updateStatus,
  getMyApplications,
  getProjectVolunteers,
  getStats,
  getNgoProjectsWithVolunteers,
};
