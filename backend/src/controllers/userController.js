const userService = require('../services/userService');
const logAktivitasService = require('../services/logAktivitasService');

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
    await logAktivitasService.catatAktivitas(
      req.user.id_user,
      `TAMBAH USER: ${username} (${role})`,
      req.ip
    );
    res.status(201).json({ message: 'User berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function remove(req, res) {
  try {
    // Ambil dulu data user agar log menyimpan nama, bukan sekadar nomor id
    const target = await userService.getProfilUser(req.params.id);
    await userService.deleteUser(req.params.id);
    await logAktivitasService.catatAktivitas(
      req.user.id_user,
      `HAPUS USER: ${target.username} (${target.role})`,
      req.ip
    );
    res.json({ message: 'User berhasil dihapus' });
  } catch (err) {
    const status = err.message === 'User tidak ditemukan' ? 404 : 500;
    res.status(status).json({ message: err.message });
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