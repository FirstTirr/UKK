const db = require('../config/db');

async function getAll() {
  return await db.query('SELECT id_user, username, role, no_hp, alamat FROM user');
}

async function getById(id) {
  return await db.query('SELECT id_user, username, role, no_hp, alamat FROM user WHERE id_user = ?', [id]);
}

async function findByUsername(username) {
  return await db.query('SELECT * FROM user WHERE username = ?', [username]);
}

async function create(username, hash, role, no_hp = null, alamat = null) {
  return await db.query(
    'INSERT INTO user (username, password_hash, role, no_hp, alamat) VALUES (?, ?, ?, ?, ?)',
    [username, hash, role, no_hp, alamat]
  );
}

/** Peminjam wajib mengisi nomor HP & alamat sebelum alat dikirim. */
async function updateProfil(id, { no_hp, alamat }) {
  return await db.query('UPDATE user SET no_hp = ?, alamat = ? WHERE id_user = ?', [no_hp, alamat, id]);
}

async function remove(id) {
  return await db.query('DELETE FROM user WHERE id_user = ?', [id]);
}

module.exports = {
  getAll,
  getById,
  findByUsername,
  create,
  updateProfil,
  remove
};
