const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../db');
const router = express.Router();

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

// POST /signup - User registration with atomic transaction
router.post('/signup', async (req, res) => {
    const { email, password, username, interests } = req.body;

    // Validation
    if (!email || !password || !username || !interests) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!Array.isArray(interests) || interests.length < 2) {
        return res.status(400).json({ error: 'You must select at least 2 interests' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Create User
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRes = await client.query(
            'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id',
            [email, hashedPassword, username]
        );
        const userId = userRes.rows[0].id;

        // 2. Create Profile
        await client.query(
            'INSERT INTO profiles (user_id) VALUES ($1)',
            [userId]
        );

        // 3. Add Interests
        // Validate that all interest IDs exist? Or just insert.
        // Assuming interests is an array of IDs.
        for (const interestId of interests) {
            await client.query(
                'INSERT INTO user_interests (user_id, interest_id) VALUES ($1, $2)',
                [userId, interestId]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'User created successfully', userId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Signup error:', err);
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Email or username already exists' });
        }
        res.status(500).json({ error: 'Server error during signup' });
    } finally {
        client.release();
    }
});

// POST /login - Basic login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // TODO: Set session or return token
        // For now, just return success
        res.json({ message: 'Login successful', userId: user.id, username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
