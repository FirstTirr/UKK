const kategoriModel = require('../models/kategoriModel');

async function getAllKategori() {
  return await kategoriModel.getAll();
}

async function getKategoriById(id) {
  return await kategoriModel.getById(id);
}

async function createKategori(nama_kategori) {
  return await kategoriModel.create(nama_kategori);
}

async function updateKategori(id, nama_kategori) {
  return await kategoriModel.update(id, nama_kategori);
}

async function deleteKategori(id) {
  return await kategoriModel.remove(id);
}

module.exports = {
  getAllKategori,
  getKategoriById,
  createKategori,
  updateKategori,
  deleteKategori
};