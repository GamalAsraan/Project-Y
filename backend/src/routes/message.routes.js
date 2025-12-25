const router = require('express').Router();
const protect = require('../middleware/auth.middleware');
const messageController = require('../controllers/messageController');

router.get('/', protect, messageController.getConversations);
router.get('/:conversationId', protect, messageController.getMessages);
router.post('/', protect, messageController.sendMessage);
router.post('/start', protect, messageController.startConversation);

module.exports = router;
