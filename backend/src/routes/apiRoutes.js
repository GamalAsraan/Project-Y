const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const searchController = require('../controllers/searchController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Profile Routes
router.get('/profile/:userId', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.post('/users/:userId/follow', authenticateToken, userController.followUser);

// Search Route
router.get('/search', authenticateToken, searchController.search);

// Post Routes
router.post('/posts', authenticateToken, postController.createPost);
router.post('/posts/:postId/like', authenticateToken, postController.likePost);
router.post('/posts/:postId/comment', authenticateToken, postController.commentPost);

module.exports = router;
