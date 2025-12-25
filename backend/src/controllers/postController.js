const { pool } = require('../db');

// Get socket.io instance (will be set by index.js)
let io = null;
const setSocketIO = (socketInstance) => {
    io = socketInstance;
};

const createPost = async (req, res) => {
    const userId = req.user.userId;
    const { content, original_post_id, media_url } = req.body;

    // The "Pure Repost" Fix: Allow null content IF original_post_id is present
    if (!content && !original_post_id) {
        return res.status(400).json({ error: 'Post content or original post ID is required' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Insert Post (content can be null for pure reposts)
        const postResult = await client.query(
            'INSERT INTO Posts (UserID, ContentBody) VALUES ($1, $2) RETURNING PostID, CreatedAt',
            [userId, content || null]
        );

        const postId = postResult.rows[0].postid;

        // Initialize Post_Counters (trigger should handle this, but ensure it exists)
        // Using ON CONFLICT to handle case where trigger already created it
        await client.query(
            'INSERT INTO Post_Counters (PostID, LikeCount, RepostCount, CommentCount) VALUES ($1, 0, 0, 0) ON CONFLICT (PostID) DO NOTHING',
            [postId]
        );

        // If this is a repost, insert into Shares_Reposts
        if (original_post_id) {
            // Verify original post exists
            const originalPostCheck = await client.query(
                'SELECT PostID, UserID FROM Posts WHERE PostID = $1',
                [original_post_id]
            );

            if (originalPostCheck.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Original post not found' });
            }

            const originalPostOwnerId = originalPostCheck.rows[0].userid;

            // Insert repost record
            await client.query(
                'INSERT INTO Shares_Reposts (UserID, PostID, RepostQuote) VALUES ($1, $2, $3)',
                [userId, original_post_id, content || null]
            );

            // Repost counter update is handled by database trigger, but we update manually as backup
            await client.query(
                'UPDATE Post_Counters SET RepostCount = RepostCount + 1 WHERE PostID = $1',
                [original_post_id]
            );

            // Emit notification to original post owner (if not self-repost)
            if (originalPostOwnerId !== userId && io) {
                io.to(`user_${originalPostOwnerId}`).emit('notification', {
                    type: 'repost',
                    postId: original_post_id,
                    triggeredBy: userId,
                    message: 'Someone reposted your post'
                });
            }
        }

        // Handle media (if provided)
        // Note: In a real app, you'd upload to S3/Cloudinary and store the URL
        // For now, we'll just store the media_url if provided
        if (media_url) {
            // You might want to add a Post_Media table or store in a JSON column
            // For now, we'll skip this as it's not in the schema
        }

        await client.query('COMMIT');

        res.status(201).json({
            postId,
            originalPostId: original_post_id || null,
            isRepost: !!original_post_id
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create post error:', error);
        res.status(500).json({ error: 'Failed to create post' });
    } finally {
        client.release();
    }
};

const likePost = async (req, res) => {
    const userId = req.user.userId;
    const { postId } = req.params;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check if already liked
        const check = await client.query(
            'SELECT * FROM Post_Likes WHERE UserID = $1 AND PostID = $2',
            [userId, postId]
        );

        if (check.rows.length > 0) {
            // Unlike
            await client.query(
                'DELETE FROM Post_Likes WHERE UserID = $1 AND PostID = $2',
                [userId, postId]
            );

            // Counter update is handled by database trigger, but we update manually as backup
            await client.query(
                'UPDATE Post_Counters SET LikeCount = GREATEST(LikeCount - 1, 0) WHERE PostID = $1',
                [postId]
            );

            await client.query('COMMIT');
            return res.json({ liked: false });
        } else {
            // Like - Use INSERT with ON CONFLICT to handle race conditions gracefully
            try {
                await client.query(
                    'INSERT INTO Post_Likes (UserID, PostID) VALUES ($1, $2)',
                    [userId, postId]
                );
            } catch (insertError) {
                // Handle duplicate key error gracefully (race condition)
                if (insertError.code === '23505') {
                    await client.query('ROLLBACK');
                    return res.status(409).json({ error: 'Already liked this post', liked: true });
                }
                throw insertError;
            }

            // Counter update is handled by database trigger, but we update manually as backup
            // (Trigger will also update, so this ensures it works even if triggers aren't installed)
            await client.query(
                'UPDATE Post_Counters SET LikeCount = LikeCount + 1 WHERE PostID = $1',
                [postId]
            );

            // Get post owner for notification
            const postResult = await client.query(
                'SELECT UserID FROM Posts WHERE PostID = $1',
                [postId]
            );

            if (postResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Post not found' });
            }

            const postOwnerId = postResult.rows[0].userid;

            await client.query('COMMIT');

            // Emit socket notification to post owner (if not self-like)
            if (postOwnerId !== userId && io) {
                io.to(`user_${postOwnerId}`).emit('notification', {
                    type: 'like',
                    postId: parseInt(postId),
                    triggeredBy: userId,
                    message: 'Someone liked your post'
                });
            }

            res.json({ liked: true });
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Like post error:', error);

        // Handle duplicate key error gracefully
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Already liked this post', liked: true });
        }

        res.status(500).json({ error: 'Failed to toggle like' });
    } finally {
        client.release();
    }
};

const commentPost = async (req, res) => {
    const userId = req.user.userId;
    const { postId } = req.params;
    const { content } = req.body;

    try {
        await pool.query(
            'INSERT INTO Comments (UserID, PostID, CommentBody) VALUES ($1, $2, $3)',
            [userId, postId, content]
        );
        res.status(201).json({ message: 'Comment added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
};

const getPosts = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.PostID, p.ContentBody, p.CreatedAt, 
                   u.UserID, u.UsernameUnique,
                   pr.DisplayName, pr.AvatarURL,
                   pc.LikeCount, pc.RepostCount, pc.CommentCount
            FROM Posts p
            JOIN Users u ON p.UserID = u.UserID
            LEFT JOIN Profiles pr ON u.UserID = pr.UserID
            LEFT JOIN Post_Counters pc ON p.PostID = pc.PostID
            ORDER BY p.CreatedAt DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

const getUserPosts = async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query(`
            SELECT p.PostID, p.ContentBody, p.CreatedAt, 
                   u.UserID, u.UsernameUnique,
                   pr.DisplayName, pr.AvatarURL,
                   pc.LikeCount, pc.RepostCount, pc.CommentCount
            FROM Posts p
            JOIN Users u ON p.UserID = u.UserID
            LEFT JOIN Profiles pr ON u.UserID = pr.UserID
            LEFT JOIN Post_Counters pc ON p.PostID = pc.PostID
            WHERE p.UserID = $1
            ORDER BY p.CreatedAt DESC
        `, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user posts' });
    }
};

module.exports = { createPost, likePost, commentPost, setSocketIO, getPosts, getUserPosts };
