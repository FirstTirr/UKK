const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

async function getAllUsers() {
  return await userModel.getAll();
}

async function createUser(username, password, role) {
  const hash = await bcrypt.hash(password, 10);
  return await userModel.create(username, hash, role);
}

async function deleteUser(id) {
  return await userModel.remove(id);
}

module.exports = {
  getAllUsers,
  createUser,
  deleteUser
};