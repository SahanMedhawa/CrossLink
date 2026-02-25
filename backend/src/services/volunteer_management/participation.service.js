const Participation = require('../../models/participation.model');
const Project = require('../../models/project');
const User = require('../../models/user.model');

/**
 * Request participation in a project (volunteer action)
 */
const requestParticipation = async (volunteerId, projectId, formData) => {
  // Verify project exists and is active
  const project = await Project.findById(projectId);
  if (!project) {
    throw { status: 404, message: 'Project not found.' };
  }
  if (project.status !== 'active') {
    throw { status: 400, message: 'Project is not currently active.' };
  }

  // Check if project still needs volunteers
  if (project.volunteersCount >= project.volunteersNeeded) {
    throw { status: 400, message: 'This project has reached its volunteer capacity.' };
  }

  // Check for duplicate participation
  const existing = await Participation.findOne({
    volunteerId,
    projectId,
  });
  if (existing) {
    throw {
      status: 400,
      message: `You have already ${existing.status === 'rejected' ? 'been rejected from' : 'applied to'} this project.`,
    };
  }

  // Validate required fields
  if (!formData.message || formData.message.trim().length < 10) {
    throw { status: 400, message: 'Motivation message must be at least 10 characters.' };
  }
  if (!formData.experienceSummary || formData.experienceSummary.trim().length < 10) {
    throw { status: 400, message: 'Experience summary must be at least 10 characters.' };
  }
  if (formData.availabilityConfirmed !== true) {
    throw { status: 400, message: 'You must confirm your availability.' };
  }

  // Create participation record with form data
  const participation = await Participation.create({
    volunteerId,
    projectId,
    ngoId: project.ngoId,
    status: 'requested',
    message: formData.message.trim(),
    experienceSummary: formData.experienceSummary.trim(),
    availabilityConfirmed: formData.availabilityConfirmed,
    preferredRole: formData.preferredRole?.trim() || undefined,
    expectedHours: formData.expectedHours || undefined,
    appliedAt: new Date(),
  });

  return participation;
};

/**
 * Update participation status (NGO action — approve/reject/complete)
 */
const updateParticipationStatus = async (participationId, ngoId, newStatus) => {
  const validStatuses = ['approved', 'rejected', 'completed'];
  if (!validStatuses.includes(newStatus)) {
    throw {
      status: 400,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}.`,
    };
  }

  const participation = await Participation.findById(participationId);
  if (!participation) {
    throw { status: 404, message: 'Participation record not found.' };
  }

  // Verify the NGO owns the project
  if (participation.ngoId.toString() !== ngoId) {
    throw { status: 403, message: 'Not authorized. You do not own this project.' };
  }

  // State transition validation
  if (newStatus === 'approved' && participation.status !== 'requested') {
    throw { status: 400, message: 'Can only approve a requested participation.' };
  }
  if (newStatus === 'rejected' && participation.status !== 'requested') {
    throw { status: 400, message: 'Can only reject a requested participation.' };
  }
  if (newStatus === 'completed' && participation.status !== 'approved') {
    throw { status: 400, message: 'Can only complete an approved participation.' };
  }

  // Update participation status
  participation.status = newStatus;

  if (newStatus === 'approved') {
    participation.approvedAt = new Date();

    // Increment project volunteer count
    await Project.findByIdAndUpdate(participation.projectId, {
      $inc: { volunteersCount: 1 },
    });

    // Increment volunteer's projectsJoinedCount
    await User.findByIdAndUpdate(participation.volunteerId, {
      $inc: { projectsJoinedCount: 1 },
    });
  }

  if (newStatus === 'completed') {
    participation.completedAt = new Date();

    // Award impact points to the volunteer
    await User.findByIdAndUpdate(participation.volunteerId, {
      $inc: { impactPoints: 10 },
    });
  }

  await participation.save();
  return participation;
};

/**
 * Update a participation request (volunteer action — only when status is 'requested')
 * Allowed fields: message, experienceSummary, expectedHours, preferredRole
 */
const updateParticipationRequest = async (participationId, volunteerId, updates) => {
  const participation = await Participation.findById(participationId);
  if (!participation) {
    throw { status: 404, message: 'Participation record not found.' };
  }

  // Verify the volunteer owns this request
  if (participation.volunteerId.toString() !== volunteerId) {
    throw { status: 403, message: 'Not authorized. This is not your participation request.' };
  }

  // Business rule: can only edit if status is 'requested'
  if (participation.status !== 'requested') {
    throw {
      status: 403,
      message: `Cannot edit a participation request that has been ${participation.status}. Only pending requests can be modified.`,
    };
  }

  // Whitelist allowed update fields
  const allowedFields = ['message', 'experienceSummary', 'expectedHours', 'preferredRole'];
  const sanitizedUpdates = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      sanitizedUpdates[key] = updates[key];
    }
  }

  // Validate message length if provided
  if (sanitizedUpdates.message && sanitizedUpdates.message.trim().length < 10) {
    throw { status: 400, message: 'Motivation message must be at least 10 characters.' };
  }
  // Validate experience summary length if provided
  if (sanitizedUpdates.experienceSummary && sanitizedUpdates.experienceSummary.trim().length < 10) {
    throw { status: 400, message: 'Experience summary must be at least 10 characters.' };
  }

  Object.assign(participation, sanitizedUpdates);
  await participation.save();
  return participation;
};

/**
 * Delete a participation request (volunteer action — only when status is 'requested')
 */
const deleteParticipationRequest = async (participationId, volunteerId) => {
  const participation = await Participation.findById(participationId);
  if (!participation) {
    throw { status: 404, message: 'Participation record not found.' };
  }

  // Verify the volunteer owns this request
  if (participation.volunteerId.toString() !== volunteerId) {
    throw { status: 403, message: 'Not authorized. This is not your participation request.' };
  }

  // Business rule: can only delete if status is 'requested'
  if (participation.status !== 'requested') {
    throw {
      status: 403,
      message: `Cannot delete a participation request that has been ${participation.status}. Only pending requests can be withdrawn.`,
    };
  }

  await Participation.findByIdAndDelete(participationId);
  return { message: 'Participation request withdrawn successfully.' };
};

/**
 * Get a single participation record by ID (for edit form)
 */
const getParticipationById = async (participationId, volunteerId) => {
  const participation = await Participation.findById(participationId)
    .populate({
      path: 'projectId',
      select: 'title description skills focusArea location startDate endDate status image',
    })
    .populate({
      path: 'ngoId',
      select: 'organizationName location photoURL',
    });

  if (!participation) {
    throw { status: 404, message: 'Participation record not found.' };
  }

  // Verify the volunteer owns this request
  if (participation.volunteerId.toString() !== volunteerId) {
    throw { status: 403, message: 'Not authorized to view this participation.' };
  }

  return participation;
};

/**
 * Get all applications for a volunteer (with project + ngo data)
 */
const getVolunteerApplications = async (volunteerId, statusFilter) => {
  const query = { volunteerId };
  if (statusFilter) {
    query.status = statusFilter;
  }

  const applications = await Participation.find(query)
    .populate({
      path: 'projectId',
      select: 'title description skills focusArea location startDate endDate status image volunteersNeeded volunteersCount',
    })
    .populate({
      path: 'ngoId',
      select: 'organizationName location photoURL',
    })
    .sort({ appliedAt: -1 });

  return applications;
};

/**
 * Get all volunteers for a specific project (NGO view)
 */
const getProjectVolunteers = async (projectId, ngoId) => {
  // Verify the project exists and the NGO owns it
  const project = await Project.findById(projectId);
  if (!project) {
    throw { status: 404, message: 'Project not found.' };
  }
  if (project.ngoId.toString() !== ngoId) {
    throw { status: 403, message: 'Not authorized. You do not own this project.' };
  }

  const volunteers = await Participation.find({ projectId })
    .populate({
      path: 'volunteerId',
      select: 'name email phone skills interests availability location bio photoURL impactPoints projectsJoinedCount',
    })
    .sort({ appliedAt: -1 });

  return volunteers;
};

/**
 * Get volunteer stats (dashboard counts)
 */
const getVolunteerStats = async (volunteerId) => {
  const volunteer = await User.findById(volunteerId).select(
    'projectsJoinedCount impactPoints'
  );

  const [requested, approved, completed, rejected] = await Promise.all([
    Participation.countDocuments({ volunteerId, status: 'requested' }),
    Participation.countDocuments({ volunteerId, status: 'approved' }),
    Participation.countDocuments({ volunteerId, status: 'completed' }),
    Participation.countDocuments({ volunteerId, status: 'rejected' }),
  ]);

  // Count unique NGOs helped
  const uniqueNgos = await Participation.distinct('ngoId', {
    volunteerId,
    status: { $in: ['approved', 'completed'] },
  });

  return {
    projectsJoined: volunteer?.projectsJoinedCount || 0,
    impactPoints: volunteer?.impactPoints || 0,
    pending: requested,
    approved,
    completed,
    rejected,
    ngosHelped: uniqueNgos.length,
    totalApplications: requested + approved + completed + rejected,
  };
};

/**
 * Get all projects for an NGO with volunteer request counts
 */
const getNgoProjectsWithVolunteerCounts = async (ngoId) => {
  const projects = await Project.find({ ngoId }).sort({ createdAt: -1 });

  const projectsWithCounts = await Promise.all(
    projects.map(async (project) => {
      const [requested, approved, completed] = await Promise.all([
        Participation.countDocuments({ projectId: project._id, status: 'requested' }),
        Participation.countDocuments({ projectId: project._id, status: 'approved' }),
        Participation.countDocuments({ projectId: project._id, status: 'completed' }),
      ]);

      return {
        ...project.toObject(),
        volunteerRequests: {
          requested,
          approved,
          completed,
          total: requested + approved + completed,
        },
      };
    })
  );

  return projectsWithCounts;
};

module.exports = {
  requestParticipation,
  updateParticipationStatus,
  updateParticipationRequest,
  deleteParticipationRequest,
  getVolunteerApplications,
  getParticipationById,
  getProjectVolunteers,
  getVolunteerStats,
  getNgoProjectsWithVolunteerCounts,
};
