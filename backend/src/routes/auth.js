const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { pool } = require('../db');

// GET /interests - Fetch master list of interests
router.get('/interests', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM interests ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/signup', authController.register);
router.post('/login', authController.login);

module.exports = router;
