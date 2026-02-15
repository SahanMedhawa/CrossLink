const User = require('../../models/user.model');

// Get all registered NGOs
const getAllNGOs = async (req, res) => {
  try {
    // Optional: pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Optional: search by location or focus area
    const { location, focusArea } = req.query;
    let filter = { userType: 'ngo' };

    if (location) filter.location = { $regex: location, $options: 'i' };
    if (focusArea) filter.focusAreas = { $in: [focusArea] };

    const ngos = await User.find(filter)
      .select('organizationName focusAreas website location contactPerson')
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      data: ngos,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllNGOs };
