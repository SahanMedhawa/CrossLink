const participationService = require('../../services/volunteer_management/participation.service');
const { emitParticipationEvent } = require('../../socket/socket.service');
const { createNotification } = require('../../services/notification.service');
const User = require('../../models/user.model');
const Project = require('../../models/project');

const notifySafely = async (payload) => {
  try {
    await createNotification(payload);
  } catch (error) {
    console.error('Notification error:', error.message);
  }
};

/**
 * POST /api/participation/request
 * Volunteer requests participation in a project
 * Body: { projectId, message, experienceSummary, availabilityConfirmed, preferredRole?, expectedHours? }
 */
const requestParticipation = async (req, res) => {
  try {
    const { projectId, message, experienceSummary, availabilityConfirmed, preferredRole, expectedHours } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'projectId is required.',
      });
    }

    const participation = await participationService.requestParticipation(
      req.user.id,
      projectId,
      { message, experienceSummary, availabilityConfirmed, preferredRole, expectedHours }
    );

    const [actorUser, project] = await Promise.all([
      User.findById(req.user.id).select('name'),
      Project.findById(participation.projectId).select('title'),
    ]);

    const actorName = actorUser?.name || 'A volunteer';
    const projectTitle = project?.title || 'your project';

    emitParticipationEvent({
      action: 'requested',
      participationId: participation._id,
      projectId: participation.projectId,
      ngoId: participation.ngoId,
      volunteerId: participation.volunteerId,
      status: participation.status,
    });

    await notifySafely({
      recipient: participation.ngoId,
      recipientRole: 'ngo',
      actor: req.user.id,
      actorRole: 'volunteer',
      type: 'participation.requested',
      title: 'New volunteer application',
      message: `${actorName} requested to join ${projectTitle}.`,
      link: '/ngo/volunteers',
      uniqueKey: `participation:requested:${participation._id}`,
      metadata: {
        participationId: participation._id,
        projectId: participation.projectId,
      },
    });

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

    const [actorUser, project] = await Promise.all([
      User.findById(req.user.id).select('name organizationName'),
      Project.findById(participation.projectId).select('title'),
    ]);

    const actorName = actorUser?.organizationName || actorUser?.name || 'The NGO';
    const projectTitle = project?.title || 'your project';

    emitParticipationEvent({
      action: 'status-changed',
      participationId: participation._id,
      projectId: participation.projectId,
      ngoId: participation.ngoId,
      volunteerId: participation.volunteerId,
      status: participation.status,
    });

    await notifySafely({
      recipient: participation.volunteerId,
      recipientRole: 'volunteer',
      actor: req.user.id,
      actorRole: 'ngo',
      type: 'participation.status-changed',
      title: 'Application status updated',
      message: `${actorName} marked your ${projectTitle} application as ${participation.status}.`,
      link: '/volunteer/applications',
      uniqueKey: `participation:status:${participation._id}:${participation.status}`,
      metadata: {
        participationId: participation._id,
        projectId: participation.projectId,
        status: participation.status,
      },
    });

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

/**
 * PATCH /api/participation/:id
 * Volunteer updates their participation request (only if status === 'requested')
 * Allowed body fields: message, experienceSummary, expectedHours, preferredRole
 */
const updateRequest = async (req, res) => {
  try {
    const participation = await participationService.updateParticipationRequest(
      req.params.id,
      req.user.id,
      req.body
    );

    const [actorUser, project] = await Promise.all([
      User.findById(req.user.id).select('name'),
      Project.findById(participation.projectId).select('title'),
    ]);

    const actorName = actorUser?.name || 'A volunteer';
    const projectTitle = project?.title || 'your project';

    emitParticipationEvent({
      action: 'request-updated',
      participationId: participation._id,
      projectId: participation.projectId,
      ngoId: participation.ngoId,
      volunteerId: participation.volunteerId,
      status: participation.status,
    });

    await notifySafely({
      recipient: participation.ngoId,
      recipientRole: 'ngo',
      actor: req.user.id,
      actorRole: 'volunteer',
      type: 'participation.request-updated',
      title: 'Volunteer application updated',
      message: `${actorName} updated their pending application for ${projectTitle}.`,
      link: '/ngo/volunteers',
      uniqueKey: `participation:updated:${participation._id}`,
      metadata: {
        participationId: participation._id,
        projectId: participation.projectId,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Participation request updated successfully.',
      data: participation,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error updating participation request.',
    });
  }
};

/**
 * DELETE /api/participation/:id
 * Volunteer withdraws their participation request (only if status === 'requested')
 */
const deleteRequest = async (req, res) => {
  try {
    const result = await participationService.deleteParticipationRequest(
      req.params.id,
      req.user.id
    );

    const [actorUser, project] = await Promise.all([
      User.findById(req.user.id).select('name'),
      Project.findById(result.projectId).select('title'),
    ]);

    const actorName = actorUser?.name || 'A volunteer';
    const projectTitle = project?.title || 'your project';

    emitParticipationEvent({
      action: 'request-deleted',
      participationId: result.participationId,
      projectId: result.projectId,
      ngoId: result.ngoId,
      volunteerId: result.volunteerId,
      status: 'requested',
    });

    await notifySafely({
      recipient: result.ngoId,
      recipientRole: 'ngo',
      actor: req.user.id,
      actorRole: 'volunteer',
      type: 'participation.request-deleted',
      title: 'Volunteer application withdrawn',
      message: `${actorName} withdrew their application from ${projectTitle}.`,
      link: '/ngo/volunteers',
      uniqueKey: `participation:deleted:${result.participationId}`,
      metadata: {
        participationId: result.participationId,
        projectId: result.projectId,
      },
    });

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error deleting participation request.',
    });
  }
};

/**
 * GET /api/participation/:id
 * Volunteer views a single participation request (for editing)
 */
const getRequestById = async (req, res) => {
  try {
    const participation = await participationService.getParticipationById(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: participation,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error fetching participation request.',
    });
  }
};

module.exports = {
  requestParticipation,
  updateStatus,
  updateRequest,
  deleteRequest,
  getRequestById,
  getMyApplications,
  getProjectVolunteers,
  getStats,
  getNgoProjectsWithVolunteers,
};
