const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { generateToken } = require('../middleware/auth.middleware');

// Helper function to get redirect path based on role
const getRedirectPath = (role) => {
  switch (role) {
    case 'ngo':
      return '/ngo/dashboard';
    case 'volunteer':
      return '/volunteer/dashboard';
    case 'corporate':
      return '/corporate/dashboard';
    default:
      return '/';
  }
};

// User Signup
const signup = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      role,
      userType,
      phone,
      location,
      // Role-specific fields
      skills,
      interests,
      availability,
      organizationName,
      registrationNumber,
      focusAreas,
      companyName,
      industry,
      csrBudget,
    } = req.body;

    // Support both 'role' and 'userType' from frontend
    const actualRole = role || userType;

    // Validate required fields
    if (!email || !password || !name || !actualRole) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, name, and role are required.',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    if (password.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'Password must not exceed 128 characters.',
      });
    }

    // Validate name length
    if (name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 100 characters.',
      });
    }

    // Validate role
    const validRoles = ['volunteer', 'ngo', 'corporate'];
    if (!validRoles.includes(actualRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be volunteer, ngo, or corporate.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user object based on role
    const userData = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      userType: actualRole,
      phone,
      location,
    };

    // Add role-specific fields
    if (actualRole === 'volunteer') {
      userData.skills = skills || [];
      userData.interests = interests || [];
      userData.availability = availability || 'flexible';
    } else if (actualRole === 'ngo') {
      userData.organizationName = organizationName;
      userData.registrationNumber = registrationNumber;
      userData.focusAreas = focusAreas || [];
    } else if (actualRole === 'corporate') {
      userData.companyName = companyName;
      userData.industry = industry;
      userData.csrBudget = csrBudget;
    }

    // Create new user
    const newUser = new User(userData);
    await newUser.save();

    // Generate token
    const token = generateToken({
      id: newUser._id,
      email: newUser.email,
      userType: newUser.userType,
    });

    // Return user data without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: userResponse,
        token,
        redirectPath: getRedirectPath(newUser.userType),
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration.',
    });
  }
};

// User Login
const login = async (req, res) => {
  try {
    const { email, password, role, userType } = req.body;
    const requestedRole = role || userType;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Find user by email (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if role matches (if provided)
    if (requestedRole && user.userType !== requestedRole) {
      return res.status(401).json({
        success: false,
        message: `Invalid credentials for ${requestedRole} login.`,
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate token
    const token = generateToken({
      id: user._id,
      email: user.email,
      userType: user.userType,
    });

    // Return user data without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: userResponse,
        token,
        redirectPath: getRedirectPath(user.userType),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login.',
    });
  }
};

// Get Current User Profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching profile.',
    });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Whitelist allowed fields to prevent privilege escalation
    const allowedFields = [
      'name', 'phone', 'location', 'bio', 'photoURL',
      'skills', 'interests', 'availability',
      'organizationName', 'registrationNumber', 'focusAreas', 'website',
      'companyName', 'industry', 'csrInterests', 'csrBudget', 'contactPerson',
    ];

    const sanitizedUpdates = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        sanitizedUpdates[key] = updates[key];
      }
    }

    const user = await User.findByIdAndUpdate(userId, sanitizedUpdates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating profile.',
    });
  }
};

// Get User by ID (for public profiles)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select(
      '-password -email -phone'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching user.',
    });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
  getUserById,
  getRedirectPath,
};
