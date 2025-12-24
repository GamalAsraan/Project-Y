const { pool } = require('./db');

const check = async () => {
    try {
        const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'posts' AND column_name = 'likes_count';
    `);
        if (res.rows.length > 0) {
            console.log('Schema appears up to date (likes_count exists).');
        } else {
            console.log('Schema is OLD or missing columns.');
        }
    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        pool.end();
    }
};

check();
