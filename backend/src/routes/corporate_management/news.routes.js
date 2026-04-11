const express = require('express');
const router = express.Router();
const { getCSRNews } = require('../../controllers/corporate_management/news.controller');

// Route to get CSR news
router.get('/csr', getCSRNews);

module.exports = router; 