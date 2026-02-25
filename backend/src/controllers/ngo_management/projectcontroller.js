const Project = require('../../models/project');
const User = require('../../models/user.model');

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      skills,
      focusArea,
      location,
      startDate,
      endDate,
      status,
      resources,
      volunteersNeeded,
      coordinates
    } = req.body;

    // Verify user is an NGO
    const ngo = await User.findById(req.user.id);
    if (ngo.userType !== 'ngo') {
      return res.status(403).json({ 
        success: false,
        message: 'Only NGOs can create projects' 
      });
    }

    // Parse resources if it's a string (from FormData)
    let parsedResources = [];
    if (resources) {
      parsedResources = typeof resources === 'string' ? JSON.parse(resources) : resources;
    }

    // Parse skills if it's a string (from FormData)
    let parsedSkills = [];
    if (skills) {
      parsedSkills = typeof skills === 'string' ? JSON.parse(skills) : skills;
    }

    const projectData = {
      title,
      description,
      ngoId: req.user.id,
      organizationName: ngo.organizationName,
      skills: parsedSkills || [],
      focusArea,
      location,
      startDate,
      endDate,
      status: status || 'active',
      resources: parsedResources || []
    };

    // Add volunteersNeeded if provided
    if (volunteersNeeded) {
      projectData.volunteersNeeded = parseInt(volunteersNeeded, 10);
    }

    // Add coordinates if provided (expects JSON string from FormData)
    if (coordinates) {
      try {
        const parsedCoords = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
        if (parsedCoords && parsedCoords.type === 'Point' && Array.isArray(parsedCoords.coordinates) && parsedCoords.coordinates.length === 2) {
          projectData.coordinates = parsedCoords;
        }
      } catch (e) {
        // Ignore invalid coordinates — field is optional
      }
    }

    // Add image path if uploaded
    if (req.file) {
      projectData.image = `/uploads/projects/${req.file.filename}`;
    }

    const project = new Project(projectData);
    await project.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
};

// Get all projects for a specific NGO (owner)
exports.getNGOProjects = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { ngoId: req.user.id };
    if (status) {
      query.status = status;
    }

    const projects = await Project.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
};

// Get all projects (public - for users to view)
exports.getAllProjects = async (req, res) => {
  try {
    const { focusArea, skills, location, status } = req.query;
    
    let query = {};
    
    // Filter by status (default to active for public view)
    query.status = status || 'active';
    
    if (focusArea) {
      query.focusArea = focusArea;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillsArray };
    }

    const projects = await Project.find(query)
      .populate('ngoId', 'organizationName email phone location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
};

// Get project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('ngoId', 'organizationName email phone location focusAreas');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message
    });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns this project
    if (project.ngoId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    // Parse resources if it's a string (from FormData)
    if (req.body.resources) {
      req.body.resources = typeof req.body.resources === 'string' 
        ? JSON.parse(req.body.resources) 
        : req.body.resources;
    }

    // Parse skills if it's a string (from FormData)
    if (req.body.skills) {
      req.body.skills = typeof req.body.skills === 'string' 
        ? JSON.parse(req.body.skills) 
        : req.body.skills;
    }

    // Parse volunteersNeeded
    if (req.body.volunteersNeeded !== undefined) {
      const parsedVolunteersNeeded = parseInt(req.body.volunteersNeeded, 10);
      if (!Number.isFinite(parsedVolunteersNeeded) || !Number.isInteger(parsedVolunteersNeeded) || parsedVolunteersNeeded < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid volunteersNeeded value. It must be an integer greater than or equal to 1.'
        });
      }
      req.body.volunteersNeeded = parsedVolunteersNeeded;
    }

    // Parse coordinates if provided (GeoJSON from FormData)
    if (req.body.coordinates) {
      try {
        const parsedCoords = typeof req.body.coordinates === 'string'
          ? JSON.parse(req.body.coordinates)
          : req.body.coordinates;
        if (parsedCoords && parsedCoords.type === 'Point' && Array.isArray(parsedCoords.coordinates) && parsedCoords.coordinates.length === 2) {
          req.body.coordinates = parsedCoords;
        } else {
          delete req.body.coordinates;
        }
      } catch (e) {
        delete req.body.coordinates; // Ignore invalid coordinates
      }
    }

    // Add new image path if uploaded
    if (req.file) {
      req.body.image = `/uploads/projects/${req.file.filename}`;
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
};

// Update project status
exports.updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['draft', 'active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: draft, active, completed, or cancelled'
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns this project
    if (project.ngoId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    project.status = status;
    await project.save();

    res.status(200).json({
      success: true,
      message: `Project status updated to ${status}`,
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating project status',
      error: error.message
    });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns this project
    if (project.ngoId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message
    });
  }
};