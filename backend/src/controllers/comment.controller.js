const pool = require('../config/db');

exports.addComment = async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  const result = await pool.query(
    `INSERT INTO comments (user_id, post_id, text)
     VALUES ($1,$2,$3)
     RETURNING *`,
    [req.user.id, postId, text]
  );

  res.json(result.rows[0]);
};

exports.getComments = async (req, res) => {
  const { postId } = req.params;

  const result = await pool.query(`
    SELECT comments.id, comments.text, comments.created_at,
           users.id as user_id, users.username
    FROM comments
    JOIN users ON users.id = comments.user_id
    WHERE post_id = $1
    ORDER BY comments.created_at ASC
  `, [postId]);

  res.json(result.rows);
};
