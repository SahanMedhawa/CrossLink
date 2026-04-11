const Participation = require('../../models/participation.model');
const Project = require('../../models/project');
const User = require('../../models/user.model');
const mongoose = require('mongoose');

const syncProjectVolunteersCount = async (projectId) => {
  const activeCount = await Participation.countDocuments({
    projectId,
    status: { $in: ['approved', 'completed'] },
  });

  await Project.findByIdAndUpdate(projectId, { volunteersCount: activeCount });
  return activeCount;
};

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

  // Re-sync first to avoid stale denormalized count before capacity check.
  const activeVolunteers = await syncProjectVolunteersCount(projectId);

  // Check if project still needs volunteers
  if (activeVolunteers >= project.volunteersNeeded) {
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
  await syncProjectVolunteersCount(participation.projectId);
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
  return {
    message: 'Participation request withdrawn successfully.',
    participationId,
    projectId: participation.projectId,
    ngoId: participation.ngoId,
    volunteerId: participation.volunteerId,
  };
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
      select: 'title description skills focusArea location startDate endDate status image volunteersNeeded volunteersCount coordinates',
    })
    .populate({
      path: 'ngoId',
      select: 'organizationName location photoURL',
    })
    .sort({ appliedAt: -1 })
    .lean();

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
    .sort({ appliedAt: -1 })
    .lean();

  return volunteers;
};

/**
 * Get volunteer stats (dashboard counts)
 */
const getVolunteerStats = async (volunteerId) => {
  const volunteerObjectId = new mongoose.Types.ObjectId(volunteerId);

  const [volunteer, statsRows] = await Promise.all([
    User.findById(volunteerId)
      .select('projectsJoinedCount impactPoints')
      .lean(),
    Participation.aggregate([
      { $match: { volunteerId: volunteerObjectId } },
      {
        $group: {
          _id: null,
          requested: {
            $sum: {
              $cond: [{ $eq: ['$status', 'requested'] }, 1, 0],
            },
          },
          approved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'approved'] }, 1, 0],
            },
          },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
            },
          },
          rejected: {
            $sum: {
              $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0],
            },
          },
          ngosHelpedSet: {
            $addToSet: {
              $cond: [
                { $in: ['$status', ['approved', 'completed']] },
                '$ngoId',
                null,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          requested: 1,
          approved: 1,
          completed: 1,
          rejected: 1,
          ngosHelped: {
            $size: {
              $filter: {
                input: '$ngosHelpedSet',
                as: 'ngo',
                cond: { $ne: ['$$ngo', null] },
              },
            },
          },
        },
      },
    ]),
  ]);

  const stats = statsRows[0] || {
    requested: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
    ngosHelped: 0,
  };

  return {
    projectsJoined: volunteer?.projectsJoinedCount || 0,
    impactPoints: volunteer?.impactPoints || 0,
    pending: stats.requested,
    approved: stats.approved,
    completed: stats.completed,
    rejected: stats.rejected,
    ngosHelped: stats.ngosHelped,
    totalApplications:
      stats.requested + stats.approved + stats.completed + stats.rejected,
  };
};

/**
 * Get all projects for an NGO with volunteer request counts
 */
const getNgoProjectsWithVolunteerCounts = async (ngoId) => {
  const projects = await Project.find({ ngoId }).sort({ createdAt: -1 }).lean();

  const projectIds = projects.map((project) => project._id);
  const groupedCounts = projectIds.length
    ? await Participation.aggregate([
        {
          $match: {
            projectId: { $in: projectIds },
            status: { $in: ['requested', 'approved', 'completed'] },
          },
        },
        {
          $group: {
            _id: {
              projectId: '$projectId',
              status: '$status',
            },
            count: { $sum: 1 },
          },
        },
      ])
    : [];

  const countsByProject = new Map();
  groupedCounts.forEach((row) => {
    const projectId = row._id.projectId.toString();
    const status = row._id.status;
    const existing = countsByProject.get(projectId) || {
      requested: 0,
      approved: 0,
      completed: 0,
    };
    existing[status] = row.count;
    countsByProject.set(projectId, existing);
  });

  const projectsWithCounts = projects.map((project) => {
    const counts = countsByProject.get(project._id.toString()) || {
      requested: 0,
      approved: 0,
      completed: 0,
    };

    return {
      ...project,
      volunteerRequests: {
        requested: counts.requested,
        approved: counts.approved,
        completed: counts.completed,
        total: counts.requested + counts.approved + counts.completed,
      },
    };
  });

  return projectsWithCounts;
};

module.exports = {
  syncProjectVolunteersCount,
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
