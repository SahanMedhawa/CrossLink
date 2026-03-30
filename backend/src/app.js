const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const authRoutes = require('./routes/auth.routes');
const ngoRoutes = require('./routes/ngo_management/ngo.routes');
const projectRoutes = require('./routes/ngo_management/Projectroutes');
const path = require('path');
const fs = require('fs');
const proposalRoutes = require('./routes/corporate_management/proposal.routes');
const corporateRoutes = require('./routes/corporate_management/corporate.routes');
const fundingRoutes = require('./routes/corporate_management/funding.routes');
const resourceRoutes = require('./routes/resource_management/resourceRoutes');
const volunteerRoutes = require('./routes/volunteer_management/volunteer.routes');
const matchmakingRoutes = require('./routes/volunteer_management/matchmaking.routes');
const participationRoutes = require('./routes/volunteer_management/participation.routes');
const sdgRoutes = require('./routes/ngo_management/sdgRoutes');
const newsRoutes = require('./routes/corporate_management/news.routes');


const app = express();

const uploadsDir = path.join(__dirname, 'uploads', 'projects');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security headers
app.use(helmet());

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Request body size limit to prevent abuse
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Sanitize data against NoSQL injection
app.use(mongoSanitize());

// Rate limiting for auth endpoints (brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per window
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
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

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

app.use('/api/resources', resourceRoutes);
app.use('/api/sdg', sdgRoutes);


// Volunteer domain routes
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/matchmaking', matchmakingRoutes);
app.use('/api/participation', participationRoutes);

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
