const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  deleteProfile,
  getPublicProfile,
} = require('../../controllers/volunteer_management/volunteer.controller');
const { requireVolunteer, requireAuth } = require('../../middleware/auth.middleware');

// Protected volunteer-only routes
router.get('/profile', requireVolunteer, getProfile);
router.put('/profile', requireVolunteer, updateProfile);
router.delete('/profile', requireVolunteer, deleteProfile);

// Public limited view (requires any authenticated user)
router.get('/:id', requireAuth, getPublicProfile);

module.exports = router;
