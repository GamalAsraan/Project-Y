const express = require('express');
const cors = require('cors');

const session = require('express-session');

const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const likeRoutes = require('./routes/like.routes');
const commentRoutes = require('./routes/comment.routes');
const apiRoutes = require('./routes/apiRoutes');
const messageRoutes = require('./routes/message.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(session({
  secret: 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true if using https
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/likes', likeRoutes);
app.use('/comments', commentRoutes);
app.use('/api', apiRoutes);
app.use('/messages', messageRoutes);
app.use('/notifications', notificationRoutes);

// test route
app.get('/', (_, res) => {
  res.json({ message: 'Project-Y API running' });
});
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});
module.exports = app;
