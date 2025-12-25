const { pool } = require('./src/db');

const backfill = async () => {
    try {
        console.log('Starting backfill of Post_Counters...');

        // Insert missing counters
        const result = await pool.query(`
            INSERT INTO Post_Counters (PostID, LikeCount, RepostCount, CommentCount)
            SELECT PostID, 0, 0, 0
            FROM Posts
            WHERE PostID NOT IN (SELECT PostID FROM Post_Counters)
            RETURNING PostID;
        `);

        console.log(`Inserted ${result.rowCount} missing counter rows.`);

        // Optional: Recalculate counts (basic version)
        // This is good to ensure consistency even if rows existed but were wrong
        // We'll do it for ALL posts to be safe
        console.log('Recalculating counts...');

        await pool.query(`
            UPDATE Post_Counters pc
            SET 
                LikeCount = (SELECT COUNT(*) FROM Post_Likes pl WHERE pl.PostID = pc.PostID),
                CommentCount = (SELECT COUNT(*) FROM Comments c WHERE c.PostID = pc.PostID),
                RepostCount = (SELECT COUNT(*) FROM Shares_Reposts sr WHERE sr.PostID = pc.PostID);
        `);

        console.log('Counts recalculated successfully.');

    } catch (error) {
        console.error('Backfill failed:', error);
    } finally {
        pool.end();
    }
};

backfill();
