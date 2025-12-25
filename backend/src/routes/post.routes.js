const router = require('express').Router();
const posts = require('../controllers/postController');
const protect = require('../middleware/auth.middleware');

router.get('/', posts.getPosts);
router.get('/user/:userId', posts.getUserPosts);
router.post('/', protect, posts.createPost);

module.exports = router;
