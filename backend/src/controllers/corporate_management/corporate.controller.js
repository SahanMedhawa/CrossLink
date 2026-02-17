const User = require('../../models/user.model');

// @desc    Get all registered Corporates
// @route   GET /api/corporates
// @access  Public
exports.getAllCorporates = async (req, res) => {
  try {
    // Query 'userType' instead of 'role' based on auth controller
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