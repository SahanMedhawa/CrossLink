const express = require('express');
const router = express.Router();
const { getImpactReport } = require('../../controllers/corporate_management/report.controller');
const { requireAuth } = require('../../middleware/auth.middleware');

// Protect all routes in this file
router.use(requireAuth);

// Get Impact Report
router.get('/impact', getImpactReport);

module.exports = router;