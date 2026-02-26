const express = require('express');
const router = express.Router();
const {
  createProject,
  getNGOProjects,
  getAllProjects,
  getProjectById,
  updateProject,
  updateProjectStatus,
  deleteProject,
  getProjectsByNGO
} = require('../../controllers/ngo_management/projectcontroller');
const { requireAuth }  = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload');

// Public routes - Users can view all projects
router.get('/all', getAllProjects);
router.get('/:id', getProjectById);
router.get('/ngoprojects/:ngoId', getProjectsByNGO);

// Protected routes - NGO authentication required
router.use(requireAuth);

// NGO routes - CRUD operations
router.post('/', upload.single('image'), createProject);
router.get('/ngo/my-projects', getNGOProjects);
router.put('/:id', upload.single('image'), updateProject);
router.put('/:id/status', updateProjectStatus);
router.delete('/:id', deleteProject);

module.exports = router;