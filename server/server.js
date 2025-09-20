const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration - Allow access from React Native and web
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://10.0.2.2:3000',
    'http://192.168.212.115:3000',
    '*' // Allow all origins for React Native development
  ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
  res.status(200).json({
    success: true,
    message: 'Bug Tracker API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🐛 Bug Tracker API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      projects: '/api/projects',
      bugs: '/api/bugs',
      dashboard: '/api/dashboard',
      github: '/api/github'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
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
