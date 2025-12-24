const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const { pool } = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // In production, set this to frontend URL
    methods: ['GET', 'POST']
  }
});

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.set('io', io);

// Routes
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
