const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { responseStandardizerMiddleware } = require('./utils/responseStandardizer');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// Enable gzip compression for better performance
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024, // Only compress responses larger than 1KB
  level: 6 // Compression level (1-9, 6 is good balance)
}));

// Security middleware
app.use(helmet());

// Compression middleware for better performance
app.use(compression({
  level: 6, // Balance between compression speed and ratio
  threshold: 1024, // Only compress responses > 1KB
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration - Environment-aware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        // Add your production frontend URLs here
        'https://your-production-frontend.com',
        'https://www.your-production-frontend.com'
      ]
    : [
        // Development: Allow all origins for React Native
        // This includes emulators, physical devices, and local development
        'http://localhost:3000', 
        'http://10.0.2.2:3000',  // Android emulator
        'http://192.168.212.115:3000',
        '*'  // Allow all for development
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Response standardization middleware
app.use(responseStandardizerMiddleware);

// Logging middleware
app.use(morgan('combined'));

// MongoDB connection
mongoose.connect(process.env.mongo_uri)
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  console.log('⚠️  Server will continue running without database connection');
  console.log('📝 API routes will return mock data for development');
  // Don't exit - continue running for development
});

// Routes
app.use('/api/test', require('./routes/test'));
app.use('/api/bugs', require('./routes/bugs'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/github', require('./routes/github'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.success({
    service: 'Bug Tracker API',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongoConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  }, 'Bug Tracker API is running!');
});

// Root endpoint
app.get('/', (req, res) => {
  res.success({
    service: '🐛 Bug Tracker API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      bugs: '/api/bugs',
      users: '/api/users',
      projects: '/api/projects',
      dashboard: '/api/dashboard',
      github: '/api/github'
    },
    documentation: 'https://github.com/your-repo/bug-tracker'
  }, 'Welcome to Bug Tracker API');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.error(
    'Something went wrong!',
    process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
    500
  );
});

// 404 handler
app.use('*', (req, res) => {
  res.error(
    'API endpoint not found',
    { path: req.originalUrl },
    404
  );
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

// Get local network IP
const os = require('os');
const networkInterfaces = os.networkInterfaces();
let networkIP = 'localhost';

// Find the first non-internal IPv4 address
for (const interfaceName of Object.keys(networkInterfaces)) {
  const iface = networkInterfaces[interfaceName];
  for (const config of iface) {
    if (config.family === 'IPv4' && !config.internal) {
      networkIP = config.address;
      break;
    }
  }
  if (networkIP !== 'localhost') break;
}

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Local API URL: http://localhost:${PORT}`);
  console.log(`📱 Network API URL: http://${networkIP}:${PORT}`);
  console.log(`🏥 Health check: http://${networkIP}:${PORT}/api/health`);
  console.log(`📋 Dashboard: http://${networkIP}:${PORT}/api/dashboard`);
  console.log(`🐛 Bugs API: http://${networkIP}:${PORT}/api/bugs`);
});

module.exports = app;
