const router = require('express').Router();
const posts = require('../controllers/post.controller');
const protect = require('../middleware/auth.middleware');

router.get('/', posts.getPosts);
router.post('/', protect, posts.createPost);

module.exports = router;
