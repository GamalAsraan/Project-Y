const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

const migrate = async () => {
    const client = await pool.connect();
    try {
        const schemaPath = path.join(__dirname, '../../schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Resetting schema...');
        await client.query('DROP SCHEMA public CASCADE');
        await client.query('CREATE SCHEMA public');

        console.log('Applying schema...');
        await client.query('BEGIN');
        await client.query(schemaSql);
        await client.query('COMMIT');
        console.log('Schema applied successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
};

migrate();
