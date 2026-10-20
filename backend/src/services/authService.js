const userModel = require('../models/userModel');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function login(username, password) {
  const users = await userModel.findByUsername(username);
  if (users.length === 0) throw new Error('Username atau password salah');

  const user = users[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error('Username atau password salah');

  const token = jwt.sign(
    { id_user: user.id_user, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'rahasia_ukk',
    { expiresIn: '1d' }
  );

  await db.query('INSERT INTO log_aktivitas (id_user, aktivitas) VALUES (?, ?)', [user.id_user, `LOGIN: ${user.username}`]);

  return { token, user: { id_user: user.id_user, username: user.username, role: user.role } };
}

module.exports = { login };