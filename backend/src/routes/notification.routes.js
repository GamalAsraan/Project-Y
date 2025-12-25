const router = require('express').Router();
const protect = require('../middleware/auth.middleware');
const notificationController = require('../controllers/notificationController');

router.get('/', protect, notificationController.getNotifications);

module.exports = router;
