const { pool } = require('./db');

const interests = [
    'Technology', 'Gaming', 'Anime', 'Politics', 'Sports',
    'Coding', 'AI', 'Crypto', 'Music', 'Movies',
    'Travel', 'Food', 'Fashion', 'Art', 'Science'
];

const seed = async () => {
    try {
        console.log('Seeding interests...');
        for (const name of interests) {
            await pool.query(
                'INSERT INTO interests (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
                [name]
            );
        }
        console.log('Seeding complete.');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        pool.end();
    }
};

seed();
