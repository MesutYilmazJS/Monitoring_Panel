const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const runMigrations = require('../db/migrate');
const createSecurityMiddleware = require('./middleware/securityMiddleware');
const createPerformanceAnalyzer = require('./services/performanceAnalyzer');
const routes = require('./routes');

const app = express();
const server = http.createServer(app);

// CORS configuration for REST & WebSockets (Allows Vercel client & Localhost)
const allowedOrigin = process.env.CLIENT_ORIGIN || '*';

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.io Server
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST']
  }
});

// Initialize Performance Analyzer & Security Middleware
const perfAnalyzer = createPerformanceAnalyzer(io);
const securityMiddleware = createSecurityMiddleware(io);

// Express Middlewares
app.use(perfAnalyzer.middleware);
app.use(securityMiddleware);

// API Routes
app.use(routes);

// Socket.io Connection & Event Handling
io.on('connection', (socket) => {
  console.log(`🔌 [Socket.io] New client connected: ${socket.id}`);

  // Handle client-initiated attack simulations
  socket.on('trigger_simulation', (data) => {
    console.log(`🎯 [Simulation Triggered] Type: ${data.type}`);
    // Broadcast notification to all connected clients
    io.emit('simulation_status', {
      type: data.type,
      status: 'EXECUTING',
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log(`❌ [Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Start synthetic background traffic generator for performance metrics
perfAnalyzer.startBackgroundTraffic(3000);

// Run DB Migrations automatically on startup then listen
const PORT = process.env.PORT || 3001;

async function startServer() {
  await runMigrations();
  
  server.listen(PORT, () => {
    console.log(`🚀 [Monitoring Server] Running on port ${PORT}`);
    console.log(`📡 [CORS Allowed Origin]: ${allowedOrigin}`);
  });
}

startServer();
