const User = require('../../models/user.model');

// @desc    Get all registered Corporates
// @route   GET /api/corporates
// @access  Public
exports.getAllCorporates = async (req, res) => {
  try {
    const corporates = await User.find({ userType: 'corporate' })
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