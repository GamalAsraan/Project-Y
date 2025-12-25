const router = require('express').Router();
const authController = require('../controllers/authController');
const protect = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;
