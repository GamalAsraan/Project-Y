const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.get('/interests', authController.getInterests);
router.post('/onboarding', authController.saveOnboarding);

module.exports = router;
