const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // In production, replace with local frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false, // For development ease
}));
app.use(morgan('dev'));
app.use(compression());
app.use(express.static('public'));

// Database connection
const connectDB = async () => {
  const dbUri = process.env.MONGODB_URI;

  if (!dbUri) {
    console.error('❌ MONGODB_URI is missing in the .env file. Backend cannot start without a database.');
    process.exit(1);
  }

  try {
    await mongoose.connect(dbUri);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Auto-seed data on connection
    const seedData = require('./utils/seeder_worker');
    await seedData();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    // process.exit(1);
  }
};

connectDB();

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log('📡 New client connected:', socket.id);

  socket.on('join-parking', () => {
    socket.join('parking-updates');
    console.log(`👤 Client ${socket.id} joined parking-updates`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Pass io to routes if needed
app.set('io', io);

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Garuda Mall Parking API is running', timestamp: new Date() });
});

// Import and use routes (once created)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/slots', require('./routes/slots'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payments', require('./routes/payments'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
