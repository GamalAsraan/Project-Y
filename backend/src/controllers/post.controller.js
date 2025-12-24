const pool = require('../config/db');

exports.getPosts = async (req, res) => {
  const result = await pool.query(`
    SELECT posts.id, posts.text, posts.created_at,
           users.id as user_id, users.username
    FROM posts
    JOIN users ON users.id = posts.user_id
    ORDER BY posts.created_at DESC
  `);

  res.json(result.rows);
};

exports.createPost = async (req, res) => {
  const { text } = req.body;

  const result = await pool.query(
    'INSERT INTO posts (user_id, text) VALUES ($1,$2) RETURNING *',
    [req.user.id, text]
  );

  res.json(result.rows[0]);
};
