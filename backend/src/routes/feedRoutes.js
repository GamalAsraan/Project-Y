const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/hybrid', authenticateToken, feedController.getHybridFeed);

module.exports = router;
