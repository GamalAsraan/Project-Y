const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.SESSION_SECRET,
        { expiresIn: '7d' }
    );
};

exports.register = async (req, res) => {
    const { email, password, username, interests } = req.body;

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
            'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id, username, role',
            [email, hashedPassword, username]
        );
        const user = userRes.rows[0];

        // 2. Create Profile
        await client.query(
            'INSERT INTO profiles (user_id) VALUES ($1)',
            [user.id]
        );

        // 3. Add Interests
        for (const interestId of interests) {
            await client.query(
                'INSERT INTO user_interests (user_id, interest_id) VALUES ($1, $2)',
                [user.id, interestId]
            );
        }

        await client.query('COMMIT');

        const token = generateToken(user);
        res.status(201).json({ message: 'User created successfully', token, user: { id: user.id, username: user.username } });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Signup error:', err);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Email or username already exists' });
        }
        res.status(500).json({ error: 'Server error during signup' });
    } finally {
        client.release();
    }
};

exports.login = async (req, res) => {
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

        const token = generateToken(user);
        res.json({ message: 'Login successful', token, user: { id: user.id, username: user.username } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
