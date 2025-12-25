const { Pool } = require('pg');
const pool = new Pool({
    connectionString: 'postgresql://postgres:password@localhost:5432/project_y'
});

const migrate = async () => {
    try {
        await pool.query('ALTER TABLE Posts ADD COLUMN IF NOT EXISTS ImageURL TEXT;');
        console.log('Migration successful: Added ImageURL to Posts table');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        pool.end();
    }
};

migrate();
