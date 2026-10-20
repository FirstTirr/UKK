const db = require('../config/db');

async function getAll() {
  return await db.query('SELECT id_user, username, role FROM user');
}

async function getById(id) {
  return await db.query('SELECT id_user, username, role FROM user WHERE id_user = ?', [id]);
}

async function findByUsername(username) {
  return await db.query('SELECT * FROM user WHERE username = ?', [username]);
}

async function create(username, hash, role) {
  return await db.query('INSERT INTO user (username, password_hash, role) VALUES (?, ?, ?)', [username, hash, role]);
}

async function remove(id) {
  return await db.query('DELETE FROM user WHERE id_user = ?', [id]);
}

module.exports = {
  getAll,
  getById,
  findByUsername,
  create,
  remove
};