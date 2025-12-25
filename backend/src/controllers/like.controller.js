const { pool } = require('../db');

exports.toggleLike = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.userId; // Middleware sets userId, not id

  try {
    // Check if already liked
    const exists = await pool.query(
      'SELECT LikeID FROM Post_Likes WHERE UserID=$1 AND PostID=$2',
      [userId, postId]
    );

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (exists.rows.length > 0) {
        // Unlike
        await client.query(
          'DELETE FROM Post_Likes WHERE UserID=$1 AND PostID=$2',
          [userId, postId]
        );

        // Decrement counter
        await client.query(
          'UPDATE Post_Counters SET LikeCount = LikeCount - 1 WHERE PostID=$1',
          [postId]
        );

        await client.query('COMMIT');
        return res.json({ liked: false });
      } else {
        // Like
        await client.query(
          'INSERT INTO Post_Likes (UserID, PostID) VALUES ($1,$2)',
          [userId, postId]
        );

        // Increment counter
        await client.query(
          'INSERT INTO Post_Counters (PostID, LikeCount) VALUES ($1, 1) ON CONFLICT (PostID) DO UPDATE SET LikeCount = Post_Counters.LikeCount + 1',
          [postId]
        );

        // Create notification (if not liking own post)
        const postRes = await client.query('SELECT UserID FROM Posts WHERE PostID = $1', [postId]);
        if (postRes.rows.length > 0 && postRes.rows[0].userid !== userId) {
          // Get Like TypeID
          const typeRes = await client.query("SELECT TypeID FROM Notification_Types WHERE TypeName = 'Like'");
          if (typeRes.rows.length > 0) {
            await client.query(
              'INSERT INTO Notifications (RecipientUserID, TypeID, TriggerUserID, TargetContentID) VALUES ($1, $2, $3, $4)',
              [postRes.rows[0].userid, typeRes.rows[0].typeid, userId, postId]
            );
          }
        }

        await client.query('COMMIT');
        return res.json({ liked: true });
      }
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};
