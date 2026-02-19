const express = require('express');
const router = express.Router();
const {
  createFunding,
  getFundingByProject,
  getMyFunding
} = require('../../controllers/corporate_management/funding.controller');

const { requireAuth } = require('../../middleware/auth.middleware');

// Protect all routes
router.use(requireAuth);

// Corporate Actions
router.post('/', createFunding);      // Create Funding
router.get('/my', getMyFunding);      // Read My Funding

// NGO Actions
router.get('/project/:projectId', getFundingByProject); // Read Project Funding

module.exports = router;