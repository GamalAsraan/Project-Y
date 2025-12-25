const { pool } = require('./src/db');
const fs = require('fs');
const path = require('path');

const resetDb = async () => {
    try {
        console.log('Dropping all tables...');
        await pool.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO public;
    `);

        console.log('Running schema.sql...');
        const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await pool.query(schemaSql);

        console.log('Running triggers.sql...');
        const triggersSql = fs.readFileSync(path.join(__dirname, 'triggers.sql'), 'utf8');
        await pool.query(triggersSql);

        // Re-create session table
        console.log('Re-creating session table...');
        await pool.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid varchar NOT NULL COLLATE "default",
        sess json NOT NULL,
        expire timestamp(6) NOT NULL
      )
      WITH (OIDS=FALSE);
      ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);
    `);

        console.log('Database reset successfully!');
    } catch (err) {
        console.error('Reset failed:', err);
    } finally {
        pool.end();
    }
};

resetDb();
