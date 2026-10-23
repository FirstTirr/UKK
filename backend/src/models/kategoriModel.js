const db = require('../config/db');

async function getAll() {
  return await db.query('SELECT * FROM kategori');
}

async function getById(id) {
  const result = await db.query('SELECT * FROM kategori WHERE id_kategori = ?', [id]);
  return result[0];
}

async function create(nama_kategori) {
  return await db.query('INSERT INTO kategori (nama_kategori) VALUES (?)', [nama_kategori]);
}

async function update(id, nama_kategori) {
  return await db.query('UPDATE kategori SET nama_kategori = ? WHERE id_kategori = ?', [nama_kategori, id]);
}

async function remove(id) {
  return await db.query('DELETE FROM kategori WHERE id_kategori = ?', [id]);
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};