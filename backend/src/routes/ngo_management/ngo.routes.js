const express = require('express');
const router = express.Router();
const { getAllNGOs } = require('../../controllers/ngo_management/ngo.controller');

// Public route: fetch all NGOs
router.get('/', getAllNGOs);

module.exports = router;