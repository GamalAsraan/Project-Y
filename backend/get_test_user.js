const { pool } = require('./src/db');

const getUser = async () => {
    try {
        const res = await pool.query('SELECT UsernameUnique, Email FROM Users LIMIT 1');
        console.log('Test User:', res.rows[0]);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
};

getUser();
