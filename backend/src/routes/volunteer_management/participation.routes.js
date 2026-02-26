const express = require('express');
const router = express.Router();
const {
  requestParticipation,
  updateStatus,
  updateRequest,
  deleteRequest,
  getRequestById,
  getMyApplications,
  getProjectVolunteers,
  getStats,
  getNgoProjectsWithVolunteers,
} = require('../../controllers/volunteer_management/participation.controller');
const {
  requireVolunteer,
  requireNGO,
} = require('../../middleware/auth.middleware');

// ── Volunteer endpoints ──
router.post('/request', requireVolunteer, requestParticipation);
router.get('/my-applications', requireVolunteer, getMyApplications);
router.get('/stats', requireVolunteer, getStats);
router.get('/:id', requireVolunteer, getRequestById);
router.patch('/:id', requireVolunteer, updateRequest);
router.delete('/:id', requireVolunteer, deleteRequest);

// ── NGO endpoints ──
router.patch('/:id/status', requireNGO, updateStatus);
router.get('/projects/:projectId/volunteers', requireNGO, getProjectVolunteers);
router.get('/ngo/projects', requireNGO, getNgoProjectsWithVolunteers);

module.exports = router;
