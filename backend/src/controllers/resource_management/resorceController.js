const User = require("../../models/user.model");
const Resource = require("../../models/resorce");
const Project = require("../../models/project");
const {sendDonationConfirmation, sendNgoNotification} = require("../../utils/emailService");

// Corporate donates 
exports.donateResource = async (req, res) => {
  try {
    const {
      resourceId,   
      name,         
      quantity,     
      corporateId,  
      description  
    } = req.body;

    const projectId = req.params.projectId;
   
    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
   
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
      // First time donation for this resource 
      resource = new Resource({
        projectId,
        name: name.trim(),
        totalQuantity: projectResource.quantity, 
        remainingQuantity: projectResource.quantity - quantity,
        description: description || projectResource.description || "",
        donatedBy: [{
          corporateId,
          quantity,
          donatedAt: new Date()
        }]
      });
    } else {
      // Resource exists - check if we have enough remaining
      if (quantity > resource.remainingQuantity) {
        return res.status(400).json({ 
          message: `Cannot donate ${quantity}. Only ${resource.remainingQuantity} remaining for ${name}` 
        });
      }

      resource.remainingQuantity -= quantity;
      resource.donatedBy.push({ 
        corporateId, 
        quantity,
        donatedAt: new Date()
      });
    }

    await resource.save();
    
    if (description && !projectResource.description) {
      projectResource.description = description;
      await project.save();
    }

    const isFullyFunded = resource.remainingQuantity === 0;

    try {
      // Fetch corporate user details
      const corporateUser = await User.findById(corporateId);
      console.log("Corporate user found:", corporateUser ? "Yes" : "No");
      
      if (corporateUser && corporateUser.email) {
        // Send confirmation to donor
        await sendDonationConfirmation(
          {
            name: resource.name,
            quantity: quantity,
            totalQuantity: resource.totalQuantity,
            remainingQuantity: resource.remainingQuantity
          },
          {
            _id: project._id,
            title: project.title,
            organizationName: project.organizationName,
            location: project.location
          },
          {
            email: corporateUser.email,
            companyName: corporateUser.companyName,
            name: corporateUser.name
          }
        );
        
        // Fetch NGO user details
        const ngoUser = await User.findById(project.ngoId);
        console.log("NGO user found:", ngoUser ? "Yes" : "No");
        
        if (ngoUser && ngoUser.email) {
          await sendNgoNotification(
            {
              name: resource.name,
              quantity: quantity,
              totalQuantity: resource.totalQuantity,
              remainingQuantity: resource.remainingQuantity
            },
            {
              _id: project._id,
              title: project.title,
              organizationName: project.organizationName,
              ngoEmail: ngoUser.email
            },
            {
              companyName: corporateUser.companyName,
              name: corporateUser.name
            }
          );
        }
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError);
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
    console.error('Donation error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET project resource status
exports.getProjectResourceStatus = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    
    // Get project to know original requirements
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Get all resources for this project from Resource collection
    const resources = await Resource.find({ projectId }).lean();
    
    // Create status map/array
    const status = [];
    
    // For each resource in project, check its status in Resource collection
    project.resources.forEach(projRes => {
      const resourceDoc = resources.find(r => r.name === projRes.name);
      
      if (resourceDoc) {
        // Resource exists in Resource collection
        status.push({
          name: projRes.name,
          originalNeed: projRes.quantity, 
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
    
    res.json(status);
    
  } catch (err) {
    console.error("❌ Error getting resource status:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get ALL resources 
exports.getAllResources = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    
    let query = {};
    
    // Add search functionality if needed
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const resources = await Resource.find(query).lean()
      .populate({
        path: 'projectId',
        model: 'Project',
        select: 'title organizationName location focusArea ngoId'
      })
      .populate({
        path: 'donatedBy.corporateId',
        model: 'User',
        select: 'name companyName email' 
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Resource.countDocuments(query);
    
    res.json(resources);
    
  } catch (err) {
    console.error("Error in getAllResources:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get single resource by ID
exports.getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId)
      .populate('projectId', 'title organizationName location');
    
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE resource
exports.updateResource = async (req, res) => {
  try {
    const { name, totalQuantity, remainingQuantity, description } = req.body;
    
    const resource = await Resource.findById(req.params.resourceId);
    
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    // Update fields
    resource.name = name || resource.name;
    resource.totalQuantity = totalQuantity || resource.totalQuantity;
    resource.remainingQuantity = remainingQuantity || resource.remainingQuantity;
    resource.description = description || resource.description;
    
    await resource.save();
    
    // Also update the project's embedded resource if it exists
    await Project.updateOne(
      { 
        _id: resource.projectId, 
        "resources.name": resource.name 
      },
      {
        $set: {
          "resources.$.quantity": resource.remainingQuantity,
          "resources.$.description": resource.description
        }
      }
    );
    
    res.json({ 
      message: "Resource updated successfully", 
      resource 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE resource
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);
    
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    // Store project ID and resource name for logging
    const projectId = resource.projectId;
    const resourceName = resource.name;
    
    // Remove from Resource collection
    await Resource.findByIdAndDelete(req.params.resourceId);
    
    // Verify project was NOT changed
    const project = await Project.findById(projectId);
    const stillExists = project.resources.some(r => r.name === resourceName);
    
    console.log(`Resource "${resourceName}" still in project:`, stillExists);
    
    res.json({ 
      success: true,
      message: "Resource deleted successfully",
      resourceId: req.params.resourceId,
      projectResourcePreserved: stillExists
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET resources by project
exports.getResourcesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const resources = await Resource.find({ projectId }).lean()
      .populate({
        path: 'projectId',
        select: 'title organizationName location focusArea ngoId'
      })
      .populate({
        path: 'donatedBy.corporateId',
        model: 'User',
        select: 'name companyName email'
      })
      .sort({ createdAt: -1 });
    
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
