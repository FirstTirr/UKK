const alatModel = require('../models/alatModel');

async function getAllAlat() {
  return await alatModel.getAll();
}

async function getAlatById(id) {
  return await alatModel.getById(id);
}

async function createAlat(data) {
  return await alatModel.create(data);
}

async function updateAlat(id, data) {
  return await alatModel.update(id, data);
}

async function deleteAlat(id) {
  return await alatModel.remove(id);
}

module.exports = {
  getAllAlat,
  getAlatById,
  createAlat,
  updateAlat,
  deleteAlat
};