const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const searchController = require('../controllers/searchController');
const protect = require('../middleware/auth.middleware');

// Profile Routes
router.get('/profile/:userId', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.post('/users/:userId/follow', protect, userController.followUser);

// Search Route
router.get('/search', protect, searchController.search);

// Post Routes
router.post('/posts', protect, postController.createPost);
router.post('/posts/:postId/like', protect, postController.likePost);
router.post('/posts/:postId/comment', protect, postController.commentPost);

module.exports = router;
