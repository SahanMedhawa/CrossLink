
const express = require("express");
const router = express.Router();
const resourceController = require("../../controllers/resource_management/resorceController");

// Add at the top of resourceRoutes.js

console.log("✅ Resource routes loaded");
console.log("📋 Available methods:", Object.keys(resourceController));


router.use((req, res, next) => {
  console.log(`📍 Resource route hit: ${req.method} ${req.originalUrl}`);
  next();
});
// GET resources by project
router.get(
  "/project/:projectId",
  resourceController.getResourcesByProject
);

// Corporate donates resource
router.post(
  "/:projectId/donate",
  resourceController.donateResource
);

// NGO updates resource
router.put(
  "/:resourceId",
  resourceController.updateResource
);

// NGO deletes resource
router.delete(
  "/:resourceId",
  resourceController.deleteResource
);

// In resourceRoutes.js
router.get("/project/:projectId/status", resourceController.getProjectResourceStatus);

module.exports = router;
