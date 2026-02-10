const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// JWT Secret - MUST be set in production
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === 'your-super-secret-jwt-key-here') {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET must be set to a strong secret in production');
    process.exit(1);
  } else {
    console.warn('⚠️  WARNING: Using default JWT secret. Set JWT_SECRET in .env for production.');
  }
}
const SECRET = JWT_SECRET || 'crosslink_dev_jwt_secret_not_for_production';

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, SECRET, {
    expiresIn: '24h',
  });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.',
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Token verification failed.',
      });
    }
  }
};

// Middleware to check if user is NGO
const requireNGO = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;

    if (req.user.userType !== 'ngo') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. NGO privileges required.',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.userType !== 'ngo') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. User not found.',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed.',
    });
  }
};

// Middleware to check if user is Volunteer
const requireVolunteer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;

    if (req.user.userType !== 'volunteer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Volunteer privileges required.',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.userType !== 'volunteer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. User not found.',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed.',
    });
  }
};

// Middleware to check if user is Corporate
const requireCorporate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;

    if (req.user.userType !== 'corporate') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Corporate privileges required.',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.userType !== 'corporate') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. User not found.',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed.',
    });
  }
};

// Middleware for any authenticated user
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;

    // Verify user still exists in database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User no longer exists.',
      });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = verifyToken(token);
        req.user = decoded;
      } catch {
        // Token invalid, continue without user
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken,
  requireNGO,
  requireVolunteer,
  requireCorporate,
  requireAuth,
  optionalAuth,
};
