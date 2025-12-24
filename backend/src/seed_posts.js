const { pool } = require('./db');
const bcrypt = require('bcrypt');

const seedPosts = async () => {
    const client = await pool.connect();
    try {
        console.log('Seeding posts...');
        await client.query('BEGIN');

        // 1. Create a test author
        const hash = await bcrypt.hash('password', 10);
        const userRes = await client.query(
            `INSERT INTO users (email, password_hash, username) 
       VALUES ('author@test.com', $1, 'content_creator') 
       ON CONFLICT (email) DO UPDATE SET email=EXCLUDED.email 
       RETURNING id`,
            [hash]
        );
        const authorId = userRes.rows[0].id;

        // Ensure profile exists
        await client.query(
            `INSERT INTO profiles (user_id, avatar_url) 
       VALUES ($1, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix') 
       ON CONFLICT (user_id) DO NOTHING`,
            [authorId]
        );

        // 2. Get Interest IDs
        const techRes = await client.query("SELECT id FROM interests WHERE name = 'Technology'");
        const gamingRes = await client.query("SELECT id FROM interests WHERE name = 'Gaming'");

        const techId = techRes.rows[0]?.id;
        const gamingId = gamingRes.rows[0]?.id;

        if (!techId || !gamingId) {
            throw new Error('Interests not found. Run seed.js first.');
        }

        // 3. Create Hashtags
        const tagRes1 = await client.query("INSERT INTO hashtags (tag) VALUES ('Technology') ON CONFLICT (tag) DO UPDATE SET tag=EXCLUDED.tag RETURNING id");
        const tagRes2 = await client.query("INSERT INTO hashtags (tag) VALUES ('Gaming') ON CONFLICT (tag) DO UPDATE SET tag=EXCLUDED.tag RETURNING id");

        const techTagId = tagRes1.rows[0].id;
        const gamingTagId = tagRes2.rows[0].id;

        // 4. Create Posts
        const posts = [
            { content: 'The future of AI is here! #Technology', tagId: techTagId },
            { content: 'Just beat the final boss! #Gaming', tagId: gamingTagId },
            { content: 'React 19 is coming soon. #Technology', tagId: techTagId },
            { content: 'Elden Ring DLC is amazing. #Gaming', tagId: gamingTagId },
        ];

        for (const p of posts) {
            const postRes = await client.query(
                'INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING id',
                [authorId, p.content]
            );
            const postId = postRes.rows[0].id;

            await client.query(
                'INSERT INTO post_hashtags (post_id, hashtag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [postId, p.tagId]
            );
        }

        await client.query('COMMIT');
        console.log('Seeding posts complete.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Seeding posts failed:', err);
    } finally {
        client.release();
        pool.end();
    }
};

seedPosts();
