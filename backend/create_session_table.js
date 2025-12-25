const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const createSessionTable = async () => {
    try {
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
        console.log('Session table created successfully');
    } catch (err) {
        if (err.code === '42P07') { // Duplicate object (constraint)
            console.log('Session table already exists (constraint check)');
        } else {
            console.error('Error creating session table:', err);
        }
    } finally {
        await pool.end();
    }
};

createSessionTable();
