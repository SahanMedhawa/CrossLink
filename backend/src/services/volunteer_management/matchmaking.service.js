const User = require('../../models/user.model');
const Project = require('../../models/project');
const Participation = require('../../models/participation.model');

/**
 * Calculate skill intersection match score
 * score = (number of overlapping skills / total required skills) * 100
 */
const calculateMatchScore = (volunteerSkills, projectSkills) => {
  if (!projectSkills || projectSkills.length === 0) return 100; // No skills required = full match

  const normalizedVolunteerSkills = volunteerSkills.map((s) =>
    s.toLowerCase().trim()
  );
  const normalizedProjectSkills = projectSkills.map((s) =>
    s.toLowerCase().trim()
  );

  const matchedSkills = normalizedProjectSkills.filter((skill) =>
    normalizedVolunteerSkills.some(
      (vs) => vs.includes(skill) || skill.includes(vs)
    )
  );

  const missingSkills = projectSkills.filter(
    (skill) =>
      !normalizedVolunteerSkills.some(
        (vs) =>
          vs.includes(skill.toLowerCase().trim()) ||
          skill.toLowerCase().trim().includes(vs)
      )
  );

  const score = Math.round((matchedSkills.length / normalizedProjectSkills.length) * 100);

  return {
    score,
    matchedSkills: projectSkills.filter((skill) =>
      normalizedVolunteerSkills.some(
        (vs) =>
          vs.includes(skill.toLowerCase().trim()) ||
          skill.toLowerCase().trim().includes(vs)
      )
    ),
    missingSkills,
  };
};

/**
 * Calculate distance between two coordinates in km (Haversine formula)
 */
const calculateDistance = (coord1, coord2) => {
  if (!coord1 || !coord2) return null;

  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

/**
 * Get matched projects for a volunteer, ranked by skill intersection score
 */
const getMatchedProjects = async (volunteerId) => {
  // Fetch volunteer profile
  const volunteer = await User.findById(volunteerId);
  if (!volunteer || volunteer.userType !== 'volunteer') {
    throw { status: 403, message: 'User is not a volunteer.' };
  }

  const volunteerSkills = volunteer.skills || [];
  const volunteerCoords =
    volunteer.coordinates && volunteer.coordinates.coordinates
      ? volunteer.coordinates.coordinates
      : null;

  // Fetch all active projects that still need volunteers
  const projects = await Project.find({
    status: 'active',
    $expr: { $lt: ['$volunteersCount', '$volunteersNeeded'] },
  }).populate('ngoId', 'organizationName email location focusAreas photoURL');

  // Get volunteer's existing participation records to filter out already-applied/completed projects
  const existingParticipations = await Participation.find({
    volunteerId,
    status: { $in: ['requested', 'approved', 'completed', 'rejected'] },
  }).select('projectId status _id');

  const participationMap = {};
  existingParticipations.forEach((p) => {
    participationMap[p.projectId.toString()] = {
      status: p.status,
      participationId: p._id,
    };
  });

  // Calculate match scores for each project — exclude completed & rejected
  const matchedProjects = projects
    .filter((project) => {
      const entry = participationMap[project._id.toString()];
      const participationStatus = entry?.status;
      return participationStatus !== 'completed' && participationStatus !== 'rejected';
    })
    .map((project) => {
    const { score, matchedSkills, missingSkills } = calculateMatchScore(
      volunteerSkills,
      project.skills || []
    );

    // Calculate distance if both have coordinates
    const projectCoords =
      project.coordinates && project.coordinates.coordinates
        ? project.coordinates.coordinates
        : null;
    const distance = calculateDistance(volunteerCoords, projectCoords);

    return {
      project: {
        _id: project._id,
        title: project.title,
        description: project.description,
        skills: project.skills,
        focusArea: project.focusArea,
        location: project.location,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
        image: project.image,
        volunteersNeeded: project.volunteersNeeded,
        volunteersCount: project.volunteersCount,
        ngo: project.ngoId,
        createdAt: project.createdAt,
      },
      matchScore: score,
      matchedSkills,
      missingSkills,
      distance,
      alreadyApplied: participationMap[project._id.toString()]?.status || null,
      participationId: participationMap[project._id.toString()]?.participationId || null,
    };
  });

  // Sort by match score descending, then by distance ascending (if available)
  matchedProjects.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    if (a.distance !== null && b.distance !== null)
      return a.distance - b.distance;
    return 0;
  });

  return matchedProjects;
};

module.exports = {
  getMatchedProjects,
  calculateMatchScore,
  calculateDistance,
};
