const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs-extra');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const mediaRoutes = require('./routes/media');
const libraryRoutes = require('./routes/library');
const streamRoutes = require('./routes/stream');
const userRoutes = require('./routes/user');

// Import utilities
const { initDatabase } = require('./db/database');
const { initTunnel } = require('./services/tunnel');
const { startLibraryScan } = require('./services/scanner');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow video streaming
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for frontend
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/stream', streamRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Plexyfin',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Initialize and start server
async function startServer() {
  try {
    // Ensure required directories exist
    await fs.ensureDir(path.join(__dirname, '../data'));
    await fs.ensureDir(process.env.TRANSCODE_TEMP || '/tmp/plexyfin-transcode');
    
    // Initialize database
    console.log('Initializing database...');
    await initDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🎬 Plexyfin server running on port ${PORT}`);
      console.log(`📺 Access at: http://localhost:${PORT}`);
      
      // Initialize tunnel if enabled
      if (process.env.ENABLE_TUNNEL === 'true') {
        initTunnel().then(url => {
          if (url) {
            console.log(`🌐 External access enabled at: ${url}`);
          }
        }).catch(err => {
          console.error('Failed to initialize tunnel:', err.message);
        });
      }
      
      // Start initial library scan
      setTimeout(() => {
        console.log('Starting initial library scan...');
        startLibraryScan();
      }, 5000);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
