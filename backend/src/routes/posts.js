const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed.controller');
const authenticateToken = require('../middleware/auth');

router.get('/feed', authenticateToken, feedController.getFeed);

module.exports = router;
