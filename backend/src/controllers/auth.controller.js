const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hash');
const { secret, expiresIn } = require('../config/jwt');

const createToken = (user) =>
  jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn });

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  const password_hash = await hashPassword(password);

  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1,$2,$3) RETURNING id, username, bio, avatar`,
    [username, email, password_hash]
  );

  const user = result.rows[0];
  res.json({ ...user, token: createToken(user) });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    'SELECT * FROM users WHERE email=$1',
    [email]
  );

  const user = result.rows[0];
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

  res.json({
    id: user.id,
    username: user.username,
    bio: user.bio,
    avatar: user.avatar,
    token: createToken(user),
  });
};

exports.me = async (req, res) => {
  const result = await pool.query(
    'SELECT id, username, bio, avatar FROM users WHERE id=$1',
    [req.user.id]
  );
  res.json(result.rows[0]);
};
