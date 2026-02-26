const express = require("express");
const router = express.Router();
const resourceController = require("../../controllers/resource_management/resorceController");
const { 
  authenticateToken, 
  requireCorporate
} = require("../../middleware/auth.middleware");

// GET all resources
router.get("/all", authenticateToken, resourceController.getAllResources);

// GET resources by project
router.get("/project/:projectId", authenticateToken, resourceController.getResourcesByProject);

// GET resource status
router.get("/project/:projectId/status", authenticateToken, resourceController.getProjectResourceStatus);

// GET single resource by ID
router.get("/:resourceId", authenticateToken, resourceController.getResourceById);

// Corporate donates resource 
router.post("/:projectId/donate", 
  authenticateToken, 
  requireCorporate, 
  resourceController.donateResource
);

// UPDATE resource
router.put("/:resourceId", 
  authenticateToken, 
  resourceController.updateResource
);

// DELETE resource 
router.delete("/:resourceId", 
  authenticateToken, 
  resourceController.deleteResource
);

module.exports = router;