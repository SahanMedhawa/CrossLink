const express = require('express');
const router = express.Router();
const { getMatchedProjects } = require('../../controllers/volunteer_management/matchmaking.controller');
const { requireVolunteer } = require('../../middleware/auth.middleware');

// Volunteer-only: get skill-matched projects
router.get('/projects', requireVolunteer, getMatchedProjects);

module.exports = router;
