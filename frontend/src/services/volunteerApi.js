import api from './api';

// ═══════════════════════════════════════
// Volunteer Profile Endpoints
// ═══════════════════════════════════════

export const getVolunteerProfile = async () => {
  const response = await api.get('/volunteer/profile');
  return response.data;
};

export const updateVolunteerProfile = async (data) => {
  const response = await api.put('/volunteer/profile', data);
  return response.data;
};

export const deleteVolunteerProfile = async () => {
  const response = await api.delete('/volunteer/profile');
  return response.data;
};

export const getPublicVolunteerProfile = async (id) => {
  const response = await api.get(`/volunteer/${id}`);
  return response.data;
};

// ═══════════════════════════════════════
// Matchmaking Endpoints
// ═══════════════════════════════════════

export const getMatchedProjects = async () => {
  const response = await api.get('/matchmaking/projects');
  return response.data;
};

// ═══════════════════════════════════════
// Participation Endpoints (Volunteer)
// ═══════════════════════════════════════

export const requestParticipation = async (projectId) => {
  const response = await api.post('/participation/request', { projectId });
  return response.data;
};

export const getMyApplications = async (status) => {
  const params = status ? { status } : {};
  const response = await api.get('/participation/my-applications', { params });
  return response.data;
};

export const getVolunteerStats = async () => {
  const response = await api.get('/participation/stats');
  return response.data;
};

// ═══════════════════════════════════════
// Participation Endpoints (NGO)
// ═══════════════════════════════════════

export const getProjectVolunteers = async (projectId) => {
  const response = await api.get(`/participation/projects/${projectId}/volunteers`);
  return response.data;
};

export const updateParticipationStatus = async (participationId, status) => {
  const response = await api.patch(`/participation/${participationId}/status`, {
    status,
  });
  return response.data;
};

export const getNgoProjectsWithVolunteers = async () => {
  const response = await api.get('/participation/ngo/projects');
  return response.data;
};
