const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});
const port = process.env.PORT || 3001;

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost'], // Allow both local dev and Docker
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
  store: new pgSession({
    pool: pool,                // Connection pool
    tableName: 'session'       // Use another table-name than the default "session" one
    // Insert connect-pg-simple options here
  }),
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: false, // Set to true if using https
    httpOnly: true,
    sameSite: 'lax' // Important for localhost
  }
}));

// Test DB Connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to Database at:', res.rows[0].now);
  }
});

// Routes
const authRoutes = require('./routes/authRoutes');
const feedRoutes = require('./routes/feedRoutes');
const apiRoutes = require('./routes/apiRoutes');
const postController = require('./controllers/postController');

// Set socket.io instance in postController
postController.setSocketIO(io);

app.use('/auth', authRoutes);
app.use('/feed', feedRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('Project-Y Backend is running!');
});

// Socket.io Connection Handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user-specific room for notifications
    socket.on('join_user_room', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined their notification room`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start Server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = { app, io };
