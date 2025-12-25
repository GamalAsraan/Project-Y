const router = require('express').Router();
const protect = require('../middleware/auth.middleware');
const comment = require('../controllers/comment.controller');

router.get('/:postId', comment.getComments);
router.post('/:postId', protect, comment.addComment);

module.exports = router;
