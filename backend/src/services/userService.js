const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

async function getAllUsers() {
  return await userModel.getAll();
}

/** Profil milik sendiri (dipakai frontend untuk mengisi no_hp & alamat). */
async function getProfilUser(id) {
  const rows = await userModel.getById(id);
  if (rows.length === 0) throw new Error('User tidak ditemukan');
  const { id_user, username, role, no_hp, alamat } = rows[0];
  return { id_user, username, role, no_hp: no_hp || '', alamat: alamat || '' };
}

async function createUser(username, password, role) {
  const hash = await bcrypt.hash(password, 10);
  return await userModel.create(username, hash, role);
}

async function deleteUser(id) {
  return await userModel.remove(id);
}

/** Simpan nomor HP & alamat milik user yang sedang login. */
async function updateProfilUser(id, { no_hp, alamat }) {
  if (!no_hp || !alamat) {
    throw new Error('Nomor HP dan alamat wajib diisi');
  }
  return await userModel.updateProfil(id, { no_hp, alamat });
}

module.exports = {
  getAllUsers,
  getProfilUser,
  createUser,
  deleteUser,
  updateProfilUser
};
