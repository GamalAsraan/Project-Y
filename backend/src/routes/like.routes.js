const router = require('express').Router();
const protect = require('../middleware/auth.middleware');
const like = require('../controllers/like.controller');

router.post('/:postId', protect, like.toggleLike);

module.exports = router;
