const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// routes (سنضيفها لاحقًا)
app.get('/', (req, res) => {
  res.json({ message: 'Project-Y API running' });
});

module.exports = app;
