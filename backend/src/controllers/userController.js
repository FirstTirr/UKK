const userService = require('../services/userService');

async function getAll(req, res) {
  try {
    const data = await userService.getAllUsers();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function create(req, res) {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Username, password, dan role wajib diisi' });
    }
    await userService.createUser(username, password, role);
    res.status(201).json({ message: 'User berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function remove(req, res) {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: 'User berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateProfil(req, res) {
  try {
    const { no_hp, alamat } = req.body;
    await userService.updateProfilUser(req.user.id_user, { no_hp, alamat });
    res.json({ message: 'Nomor HP dan alamat berhasil disimpan' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getProfil(req, res) {
  try {
    res.json(await userService.getProfilUser(req.user.id_user));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
}

module.exports = {
  getAll,
  create,
  remove,
  updateProfil,
  getProfil
};