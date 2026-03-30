require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const { initSocket } = require('./socket/socket.service');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crosslink';

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, {
    maxPoolSize: 30,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 60000,
    heartbeatFrequencyMS: 10000,
    maxIdleTimeMS: 30000,
    family: 4
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');

    // Start HTTP + WebSocket server
    const httpServer = http.createServer(app);
    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`🚀 CrossLink server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn(`⚠️ MongoDB disconnected (state=${mongoose.connection.readyState}). Waiting for automatic reconnect...`);
});
mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected.');
});
mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB connection error event:', error.message);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
});
