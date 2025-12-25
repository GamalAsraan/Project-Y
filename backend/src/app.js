const express = require('express');
const cors = require('cors');

const session = require('express-session');

const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const likeRoutes = require('./routes/like.routes');
const commentRoutes = require('./routes/comment.routes');
const messageRoutes = require('./routes/message.routes');
const notificationRoutes = require('./routes/notification.routes');

// ... imports ...

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
