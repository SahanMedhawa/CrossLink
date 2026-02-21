const Resource = require("../../models/resorce");
const Project = require("../../models/project");

// ✅ GET all resources for a project
exports.getResourcesByProject = async (req, res) => {
  try {
    const resources = await Resource.find({
      projectId: req.params.projectId
    });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Corporate donates / adds resource to a project
exports.donateResource = async (req, res) => {
  console.log("🎯 DONATE RESOURCE CONTROLLER HIT!");
  
  try {
    const {
      resourceId,   // This is the project.resources _id
      name,         // resource name
      quantity,     // donated quantity
      corporateId,  // corporate user id
      description   // optional
    } = req.body;

    const projectId = req.params.projectId;
    
    console.log("🔍 Looking for project with ID:", projectId);
    
    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      console.log("❌ Project not found!");
      return res.status(404).json({ message: "Project not found" });
    }
    
    console.log("✅ Project found:", project.title);
    
    // Find the matching resource in project
    const projectResource = project.resources.find(
      r => r.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    
    if (!projectResource) {
      return res.status(404).json({ message: "Resource not found in project" });
    }
    
    // Find or create resource in Resource collection
    let resource = await Resource.findOne({ 
      projectId: projectId,
      name: name.trim() 
    });
    
    if (!resource) {
      // First time donation for this resource - CREATE IT
      console.log("🆕 Creating NEW resource in Resource collection");
      
      resource = new Resource({
        projectId,
        name: name.trim(),
        totalQuantity: projectResource.quantity, // Store ORIGINAL required quantity
        remainingQuantity: projectResource.quantity - quantity, // Subtract donation
        description: description || projectResource.description || "",
        donatedBy: [{
          corporateId,
          quantity,
          donatedAt: new Date()
        }]
      });
      
      console.log("✅ New resource created. Original need:", projectResource.quantity);
    } else {
      // Resource exists - check if we have enough remaining
      if (quantity > resource.remainingQuantity) {
        return res.status(400).json({ 
          message: `Cannot donate ${quantity}. Only ${resource.remainingQuantity} remaining for ${name}` 
        });
      }
      
      console.log("📊 Resource before update:", {
        totalQuantity: resource.totalQuantity, // Original need (never changes)
        remainingQuantity: resource.remainingQuantity // What's left
      });

      // Update remaining quantity (totalQuantity stays the same - it's the original need)
      resource.remainingQuantity -= quantity;
      resource.donatedBy.push({ 
        corporateId, 
        quantity,
        donatedAt: new Date()
      });
      
      console.log("✅ Resource updated");
    }

    await resource.save();
    
    // DO NOT change project.resources.quantity - keep original
    // Only update description if provided
    if (description && !projectResource.description) {
      projectResource.description = description;
      await project.save();
    }
    
    console.log("✅ All saved successfully");
    console.log("📊 Final resource state:", {
      resourceName: resource.name,
      originalNeed: resource.totalQuantity, // Never changes
      remainingNeeded: resource.remainingQuantity, // Goes down with each donation
      totalDonatedSoFar: resource.totalQuantity - resource.remainingQuantity,
      donations: resource.donatedBy.length
    });

    // Check if resource is now fully funded
    const isFullyFunded = resource.remainingQuantity === 0;
    if (isFullyFunded) {
      console.log("🎉 Resource is now FULLY FUNDED!");
    }

    res.status(200).json({
      message: "Donation submitted successfully",
      resource,
      projectName: project.title,
      isFullyFunded,
      remainingQuantity: resource.remainingQuantity,
      originalNeed: resource.totalQuantity
    });

  } catch (err) {
    console.error("❌ Error in donateResource:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE resource (NGO only)
exports.updateResource = async (req, res) => {
  try {
    const { totalQuantity, description } = req.body;
    const resource = await Resource.findById(req.params.resourceId);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const difference = totalQuantity - resource.totalQuantity;

    resource.totalQuantity = totalQuantity;
    resource.remainingQuantity += difference;
    resource.description = description;

    await resource.save();

    // Sync Project DB
    await Project.updateOne(
      { _id: resource.projectId, "resources.name": resource.name },
      {
        $set: {
          "resources.$.quantity": resource.remainingQuantity
        }
      }
    );

    res.json({ message: "Resource updated", resource });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE resource (NGO only)
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    await Resource.findByIdAndDelete(req.params.resourceId);

    // Remove from Project DB
    await Project.updateOne(
      { _id: resource.projectId },
      { $pull: { resources: { name: resource.name } } }
    );

    res.json({ message: "Resource deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET project resource status (SINGLE VERSION - FIXED)
exports.getProjectResourceStatus = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    
    console.log("📊 Getting resource status for project:", projectId);
    
    // Get project to know original requirements
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Get all resources for this project from Resource collection
    const resources = await Resource.find({ projectId });
    
    console.log(`📦 Found ${resources.length} resources in Resource collection`);
    
    // Create status map/array
    const status = [];
    
    // For each resource in project, check its status in Resource collection
    project.resources.forEach(projRes => {
      const resourceDoc = resources.find(r => r.name === projRes.name);
      
      if (resourceDoc) {
        // Resource exists in Resource collection
        status.push({
          name: projRes.name,
          originalNeed: projRes.quantity, // From project (never changes)
          totalDonated: resourceDoc.totalQuantity - resourceDoc.remainingQuantity,
          remainingNeeded: resourceDoc.remainingQuantity,
          isFullyFunded: resourceDoc.remainingQuantity === 0,
          donations: resourceDoc.donatedBy.map(d => ({
            corporateId: d.corporateId,
            quantity: d.quantity,
            donatedAt: d.donatedAt
          }))
        });
      } else {
        // No donations yet for this resource
        status.push({
          name: projRes.name,
          originalNeed: projRes.quantity,
          totalDonated: 0,
          remainingNeeded: projRes.quantity,
          isFullyFunded: false,
          donations: []
        });
      }
    });
    
    console.log("✅ Status response:", status);
    res.json(status);
    
  } catch (err) {
    console.error("❌ Error getting resource status:", err);
    res.status(500).json({ error: err.message });
  }
};