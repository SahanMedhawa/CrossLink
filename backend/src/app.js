const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const authRoutes = require('./routes/auth.routes');
const ngoRoutes = require('./routes/ngo_management/ngo.routes');
const projectRoutes = require('./routes/ngo_management/Projectroutes');
const proposalRoutes = require('./routes/corporate_management/proposal.routes');
const corporateRoutes = require('./routes/corporate_management/corporate.routes');
const fundingRoutes = require('./routes/corporate_management/funding.routes');
const resourceRoutes = require('./routes/resource_management/resourceRoutes');
const volunteerRoutes = require('./routes/volunteer_management/volunteer.routes');
const matchmakingRoutes = require('./routes/volunteer_management/matchmaking.routes');
const participationRoutes = require('./routes/volunteer_management/participation.routes');
const notificationRoutes = require('./routes/notifications.routes');
const sdgRoutes = require('./routes/ngo_management/sdgRoutes');




const newsRoutes = require('./routes/corporate_management/news.routes');
const reportRoutes = require('./routes/corporate_management/report.routes');


const app = express();

const isLoopbackAddress = (value = '') => {
  const normalized = String(value).trim();
  return (
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized === '::ffff:127.0.0.1' ||
    normalized === 'localhost'
  );
};

const shouldSkipRateLimit = (req) => {
  if (process.env.NODE_ENV === 'production') return false;

  const forwardedFor = req.headers['x-forwarded-for'];
  const firstForwardedIp = typeof forwardedFor === 'string'
    ? forwardedFor.split(',')[0].trim()
    : '';

  return (
    isLoopbackAddress(req.ip) ||
    isLoopbackAddress(req.hostname) ||
    isLoopbackAddress(req.socket?.remoteAddress) ||
    isLoopbackAddress(firstForwardedIp)
  );
};

// Security headers
app.use(helmet());

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
    : true,
  credentials: true,
}));

// Request body size limit to prevent abuse
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Sanitize data against NoSQL injection
app.use(mongoSanitize());

// Rate limiting for auth endpoints (brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 auth requests per window
  skip: shouldSkipRateLimit,
  message: {
    success: false,
    message: 'Too many requests. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000, // Increased significantly: modern SPAs make many concurrent requests
  skip: shouldSkipRateLimit,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiters
app.use('/api/auth/signup', authLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/corporates', corporateRoutes); 
app.use('/api/funding', fundingRoutes);

app.use('/api/proposals', proposalRoutes);

app.use('/api/corporate/news', newsRoutes);

app.use('/api/corporate/reports', reportRoutes); 

app.use('/api/resources', resourceRoutes);
app.use('/api/sdg', sdgRoutes);


// Volunteer domain routes
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/matchmaking', matchmakingRoutes);
app.use('/api/participation', participationRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CrossLink API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});




module.exports = app;
