const pool = require('../config/db');

exports.toggleLike = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  const exists = await pool.query(
    'SELECT id FROM likes WHERE user_id=$1 AND post_id=$2',
    [userId, postId]
  );

  if (exists.rows.length > 0) {
    await pool.query(
      'DELETE FROM likes WHERE user_id=$1 AND post_id=$2',
      [userId, postId]
    );
    return res.json({ liked: false });
  }

  await pool.query(
    'INSERT INTO likes (user_id, post_id) VALUES ($1,$2)',
    [userId, postId]
  );

  res.json({ liked: true });
};
