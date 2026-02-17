const express = require('express');
const router = express.Router();
const { 
  getAllCorporates, 
  getCorporateById 
} = require('../../controllers/corporate_management/corporate.controller');


// const { protect } = require('../../middleware/auth.middleware');
// router.use(protect); 

router.route('/')
  .get(getAllCorporates); // GET /api/corporates

router.route('/:id')
  .get(getCorporateById); // GET /api/corporates/65f8...

module.exports = router;