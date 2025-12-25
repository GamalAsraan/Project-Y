const { pool } = require('../db');

exports.addComment = async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;
  const userId = req.user.userId;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO Comments (UserID, PostID, CommentBody)
             VALUES ($1,$2,$3)
             RETURNING CommentID, CommentBody, CreatedAt`,
        [userId, postId, text]
      );

      // Increment counter
      await client.query(
        'INSERT INTO Post_Counters (PostID, CommentCount) VALUES ($1, 1) ON CONFLICT (PostID) DO UPDATE SET CommentCount = Post_Counters.CommentCount + 1',
        [postId]
      );

      // Create notification (if not commenting on own post)
      const postRes = await client.query('SELECT UserID FROM Posts WHERE PostID = $1', [postId]);
      if (postRes.rows.length > 0 && postRes.rows[0].userid !== userId) {
        // Get Comment TypeID
        const typeRes = await client.query("SELECT TypeID FROM Notification_Types WHERE TypeName = 'Comment'");
        if (typeRes.rows.length > 0) {
          await client.query(
            'INSERT INTO Notifications (RecipientUserID, TypeID, TriggerUserID, TargetContentID) VALUES ($1, $2, $3, $4)',
            [postRes.rows[0].userid, typeRes.rows[0].typeid, userId, postId]
          );
        }
      }

      await client.query('COMMIT');

      // Fetch user details for response
      const userRes = await pool.query('SELECT UsernameUnique, AvatarURL FROM Users LEFT JOIN Profiles ON Users.UserID = Profiles.UserID WHERE Users.UserID = $1', [userId]);

      const newComment = {
        id: result.rows[0].commentid,
        text: result.rows[0].commentbody,
        created_at: result.rows[0].createdat,
        user: {
          id: userId,
          username: userRes.rows[0].usernameunique,
          avatar: userRes.rows[0].avatarurl
        }
      };

      res.json(newComment);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

exports.getComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const result = await pool.query(`
        SELECT 
            C.CommentID, 
            C.CommentBody, 
            C.CreatedAt,
            U.UserID, 
            U.UsernameUnique,
            P.AvatarURL
        FROM Comments C
        JOIN Users U ON U.UserID = C.UserID
        LEFT JOIN Profiles P ON U.UserID = P.UserID
        WHERE C.PostID = $1
        ORDER BY C.CreatedAt ASC
      `, [postId]);

    const comments = result.rows.map(row => ({
      id: row.commentid,
      text: row.commentbody,
      created_at: row.createdat,
      user: {
        id: row.userid,
        username: row.usernameunique,
        avatar: row.avatarurl
      }
    }));

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};
