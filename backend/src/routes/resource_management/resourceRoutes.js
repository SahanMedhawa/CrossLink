const express = require("express");
const router = express.Router();
const resourceController = require("../../controllers/resource_management/resorceController");

//Get all resources
router.get("/all", resourceController.getAllResources);

// Corporate donates resource
router.post("/:projectId/donate",resourceController.donateResource);

// Resource status
router.get("/project/:projectId/status", resourceController.getProjectResourceStatus);

// GET single resource by ID
router.get("/:resourceId", resourceController.getResourceById);

// GET resources by project
router.get("/project/:projectId", resourceController.getResourcesByProject);

// UPDATE resource
router.put("/:resourceId", resourceController.updateResource);

// DELETE resource
router.delete("/:resourceId", resourceController.deleteResource);


module.exports = router;
