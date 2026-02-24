const express = require('express');
const router = express.Router();
const {
  requestParticipation,
  updateStatus,
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

// ── NGO endpoints ──
router.patch('/:id/status', requireNGO, updateStatus);
router.get('/projects/:projectId/volunteers', requireNGO, getProjectVolunteers);
router.get('/ngo/projects', requireNGO, getNgoProjectsWithVolunteers);

module.exports = router;
