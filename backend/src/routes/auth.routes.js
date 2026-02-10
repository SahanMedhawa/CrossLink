const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  getProfile,
  updateProfile,
  getUserById,
} = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);

// Public user profile (limited info)
router.get('/user/:id', getUserById);

module.exports = router;
