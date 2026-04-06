const User = require('../../models/user.model');

// @desc    Get all registered Corporates
// @route   GET /api/corporates
// @access  Public
exports.getAllCorporates = async (req, res) => {
  try {
    // Query 'userType' instead of 'role' based on auth controller
    const corporates = await User.find({ userType: 'corporate' }).lean()
      .select('-password -__v') 
      .lean();

    if (!corporates || corporates.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: 'No corporates found yet.',
        data: []
      });
    }

    res.status(200).json({
      success: true,
      count: corporates.length,
      data: corporates
    });

  } catch (error) {
    console.error('Error fetching corporates:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Get single Corporate by ID
// @route   GET /api/corporates/:id
// @access  Public
exports.getCorporateById = async (req, res) => {
  try {
    const corporate = await User.findById(req.params.id)
      .select('-password -__v');

    if (!corporate || corporate.userType !== 'corporate') {
      return res.status(404).json({ 
        success: false, 
        message: 'Corporate not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: corporate
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// ✅ DELETE THE DUPLICATE 'const User...' LINE THAT WAS HERE
// The function below can still use 'User' because it's imported at the top!

// @desc    Update Corporate Profile
// @route   PUT /api/corporates/profile
// @access  Private (Corporate)
exports.updateProfile = async (req, res) => {
  try {
    const corporateId = req.user.id;
    const { companyName, industry, location, bio, contactPerson, website, csrBudget, csrInterests } = req.body;

    // Find and update
    const updatedCorporate = await User.findByIdAndUpdate(
      corporateId,
      {
        companyName,
        industry,
        location,
        bio,
        contactPerson,
        website,
        csrBudget,
        csrInterests,
      },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!updatedCorporate) {
      return res.status(404).json({ success: false, message: 'Corporate not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedCorporate
    });

  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get logged-in Corporate's full profile
// @route   GET /api/corporates/profile
// @access  Private
exports.getMyProfile = async (req, res) => {
  try {
    // req.user.id comes from the auth middleware
    const corporate = await User.findById(req.user.id).select('-password -__v');

    if (!corporate || corporate.userType !== 'corporate') {
      return res.status(404).json({ success: false, message: 'Corporate profile not found' });
    }

    res.json({
      success: true,
      data: corporate
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get Dashboard Stats for Corporate
// @route   GET /api/corporates/dashboard-stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const corporateId = req.user.id;
    
    // Import models
    const Proposal = require('../../models/proposal');
    const Funding = require('../../models/funding');
    const Project = require('../../models/project');

    // ✅ 1. Active Partnerships: Count UNIQUE NGOs (Not total proposals)
    // We fetch all data and extract unique NGO IDs
    const allProposals = await Proposal.find({ corporateId }).populate('projectId', 'ngoId');
    const allFundings = await Funding.find({ corporateId }).populate('projectId', 'ngoId');

    const ngoIds = new Set();

    // Add NGO IDs from Proposals
    allProposals.forEach(p => {
      if (p.projectId && p.projectId.ngoId) {
        ngoIds.add(p.projectId.ngoId.toString());
      }
    });

    // Add NGO IDs from Fundings
    allFundings.forEach(f => {
      if (f.projectId && f.projectId.ngoId) {
        ngoIds.add(f.projectId.ngoId.toString());
      }
    });

    const activePartnerships = ngoIds.size; // This will now be 4

    // ✅ 2. Projects Funded: Count ALL funding records (Keep as 22)
    const totalFundings = await Funding.countDocuments({ corporateId });

    // ✅ 3. Lives Impacted: Sum beneficiaries from ALL associated projects
    const projectIds = [
      ...allProposals.map(p => p.projectId?._id),
      ...allFundings.map(f => f.projectId?._id)
    ];

    let livesImpacted = 0;
    if (projectIds.length > 0) {
      const uniqueProjectIds = [...new Set(projectIds.map(id => id ? id.toString() : null))].filter(id => id);
      
      if (uniqueProjectIds.length > 0) {
        const projects = await Project.find({ _id: { $in: uniqueProjectIds } });
        projects.forEach(proj => {
          livesImpacted += (proj.estimatedBeneficiaries || proj.targetBeneficiaries || 0); 
        });
      }
    }

    // ✅ 4. CSR Rating: Mock based on total volume
    let csrRating = "-";
    const totalActions = activePartnerships + totalFundings; // Updated to use unique partnerships
    if (totalActions > 20) csrRating = "5.0";
    else if (totalActions > 10) csrRating = "4.5";
    else if (totalActions > 5) csrRating = "4.0";
    else if (totalActions > 0) csrRating = "3.5";

    res.json({
      success: true,
      data: {
        activePartnerships, // Now shows UNIQUE partners (4)
        projectsFunded: totalFundings,       // Shows TOTAL fundings (22)
        livesImpacted,
        csrRating
      }
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};