const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

app.get('/', (_, res) => {
  res.json({ message: 'Project-Y API running' });
});

module.exports = app;
