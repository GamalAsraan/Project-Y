const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const register = async (req, res) => {
    const { email, password, username } = req.body;
    const client = await pool.connect();
    
    try {
        // BEGIN TRANSACTION
        await client.query('BEGIN');
        
        const hashedPassword = await bcrypt.hash(password, 10);
        // Default StatusID = 1 (Active)
        const result = await client.query(
            'INSERT INTO Users (Email, PasswordHash, UsernameUnique, StatusID) VALUES ($1, $2, $3, 1) RETURNING UserID, UsernameUnique',
            [email, hashedPassword, username]
        );

        const userId = result.rows[0].userid;
        const usernameUnique = result.rows[0].usernameunique;

        // Create Profile (within transaction)
        await client.query(
            'INSERT INTO Profiles (UserID, DisplayName) VALUES ($1, $2)',
            [userId, username]
        );

        // Initialize Post_Counters for future posts (optional, but good practice)
        // Note: We'll create counters when posts are created, so skipping here

        // COMMIT TRANSACTION
        await client.query('COMMIT');

        // Set Session
        req.session.user = {
            id: userId,
            username: usernameUnique
        };

        // Generate JWT Token
        const token = jwt.sign(
            { userId: userId, username: usernameUnique },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '30d' }
        );

        res.status(201).json({
            user: { id: userId, username: usernameUnique },
            token,
            hasCompletedOnboarding: false
        });
    } catch (error) {
        // ROLLBACK TRANSACTION on error
        await client.query('ROLLBACK');
        console.error('Registration error:', error);
        
        // Handle specific database errors
        if (error.code === '23505') { // Unique constraint violation
            if (error.constraint === 'users_email_key') {
                return res.status(400).json({ error: 'Email already exists' });
            }
            if (error.constraint === 'users_usernameunique_key') {
                return res.status(400).json({ error: 'Username already taken' });
            }
        }
        
        res.status(500).json({ error: 'Registration failed' });
    } finally {
        client.release();
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM Users WHERE Email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.passwordhash);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

        // Check Onboarding Status
        const interestCheck = await pool.query('SELECT COUNT(*) FROM User_Interests WHERE UserID = $1', [user.userid]);
        const hasCompletedOnboarding = parseInt(interestCheck.rows[0].count) > 0;

        // Set Session
        req.session.user = {
            id: user.userid,
            username: user.usernameunique
        };

        // Generate JWT Token
        const token = jwt.sign(
            { userId: user.userid, username: user.usernameunique },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '30d' }
        );

        res.json({
            user: { id: user.userid, username: user.usernameunique },
            token,
            hasCompletedOnboarding
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
};

const logout = (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Logout failed' });
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
};

const getMe = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    // Optional: Refresh data from DB
    // For now, return session data + onboarding status
    try {
        const interestCheck = await pool.query('SELECT COUNT(*) FROM User_Interests WHERE UserID = $1', [req.session.user.id]);
        const hasCompletedOnboarding = parseInt(interestCheck.rows[0].count) > 0;

        res.json({
            user: req.session.user,
            hasCompletedOnboarding
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

const getInterests = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Interests');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch interests' });
    }
};

const saveOnboarding = async (req, res) => {
    const { interestIds } = req.body;

    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const userId = req.session.user.id;

    // Tag Constraint: Must have at least 2 interests
    if (!Array.isArray(interestIds) || interestIds.length < 2) {
        return res.status(400).json({ error: 'Please select at least 2 interests' });
    }

    const client = await pool.connect();
    
    try {
        // BEGIN TRANSACTION
        await client.query('BEGIN');

        // Clear existing interests (in case user is re-doing onboarding)
        await client.query('DELETE FROM User_Interests WHERE UserID = $1', [userId]);

        // Insert new interests
        for (const interestId of interestIds) {
            await client.query(
                'INSERT INTO User_Interests (UserID, InterestID) VALUES ($1, $2)',
                [userId, interestId]
            );
        }

        // COMMIT TRANSACTION
        await client.query('COMMIT');

        res.json({ message: 'Onboarding complete' });
    } catch (error) {
        // ROLLBACK TRANSACTION on error
        await client.query('ROLLBACK');
        console.error('Onboarding error:', error);
        res.status(500).json({ error: 'Onboarding failed' });
    } finally {
        client.release();
    }
};

module.exports = { register, login, logout, getMe, getInterests, saveOnboarding };
