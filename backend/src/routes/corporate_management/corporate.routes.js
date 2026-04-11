const express = require('express');
const router = express.Router();
const { 
  getAllCorporates, 
  getCorporateById,
  updateProfile,
  getMyProfile,
   getDashboardStats 
} = require('../../controllers/corporate_management/corporate.controller');

// Import Auth Middleware
const { requireAuth } = require('../../middleware/auth.middleware');

// Protect all routes
router.use(requireAuth); 

// Existing Routes
router.route('/')
  .get(getAllCorporates); // GET /api/corporates

//  2. ADD NEW ROUTE: Get My Profile (MUST BE BEFORE /:id)
// Method: GET
// URL: /api/corporates/profile
// Access: Private
router.get('/profile', getMyProfile); 

//  3. Update Profile Route
// Method: PUT
// URL: /api/corporates/profile
// Access: Private
router.put('/profile', updateProfile); 

router.get('/dashboard-stats', requireAuth, getDashboardStats); 



// Dynamic ID Route 
// Method: GET
// URL: /api/corporates/:id
router.route('/:id')
  .get(getCorporateById); 

module.exports = router;