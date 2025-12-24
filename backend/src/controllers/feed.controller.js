const { pool } = require('../db');

exports.getFeed = async (req, res) => {
    const userId = req.user.id;
    const { cursor, limit = 10 } = req.query;

    try {
        // Check if user follows anyone
        const followsRes = await pool.query(
            'SELECT following_id FROM follows WHERE follower_id = $1',
            [userId]
        );
        const followingIds = followsRes.rows.map(r => r.following_id);

        let query = '';
        let params = [userId, limit];
        let paramIndex = 3;

        if (followingIds.length > 0) {
            // Hybrid Feed: Posts from following + Interests
            // For simplicity in this iteration, we'll fetch posts from following AND posts matching user interests
            // A more complex query would be needed to perfectly interleave them or weight them.
            // Here we just grab from both pools.

            query = `
        SELECT p.*, u.username, u.role, pr.avatar_url,
          (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = $1) > 0 AS is_liked,
          (SELECT username FROM users WHERE id = p.user_id) as author_username
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN profiles pr ON u.id = pr.user_id
        WHERE (
          p.user_id = ANY(SELECT following_id FROM follows WHERE follower_id = $1)
          OR
          EXISTS (
            SELECT 1 FROM post_hashtags ph
            JOIN hashtags h ON ph.hashtag_id = h.id
            JOIN interests i ON i.name = h.tag -- Assuming interest name matches hashtag? Or we need a mapping.
            -- Actually, the requirement says "posts matching their selected Interest Tags".
            -- We need to link posts to interests. 
            -- Let's assume posts have hashtags that match interest names.
            WHERE ph.post_id = p.id
            AND i.id IN (SELECT interest_id FROM user_interests WHERE user_id = $1)
          )
        )
      `;
        } else {
            // Cold Start: Only posts from Interest Tags
            query = `
        SELECT p.*, u.username, u.role, pr.avatar_url,
          (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = $1) > 0 AS is_liked
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN profiles pr ON u.id = pr.user_id
        WHERE EXISTS (
            SELECT 1 FROM post_hashtags ph
            JOIN hashtags h ON ph.hashtag_id = h.id
            JOIN interests i ON i.name = h.tag
            WHERE ph.post_id = p.id
            AND i.id IN (SELECT interest_id FROM user_interests WHERE user_id = $1)
        )
      `;
        }

        if (cursor) {
            query += ` AND p.created_at < $${paramIndex}`;
            params.push(cursor);
            paramIndex++;
        }

        query += ` ORDER BY p.created_at DESC LIMIT $2`;

        const result = await pool.query(query, params);

        const posts = result.rows;
        const nextCursor = posts.length === parseInt(limit) ? posts[posts.length - 1].created_at : null;

        res.json({ posts, nextCursor });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching feed' });
    }
};
