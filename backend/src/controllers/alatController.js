const alatService = require('../services/alatService');

async function getAll(req, res) {
  try {
    const data = await alatService.getAllAlat();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getById(req, res) {
  try {
    const data = await alatService.getAlatById(req.params.id);
    if (!data) {
      return res.status(404).json({ message: 'Data alat tidak ditemukan' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function create(req, res) {
  try {
    const { nama_alat, id_kategori, stok, deskripsi, harga_perhari } = req.body;
    if (!nama_alat || !id_kategori || stok === undefined) {
      return res.status(400).json({ message: 'Nama alat, id_kategori, dan stok wajib diisi' });
    }
    await alatService.createAlat({ nama_alat, id_kategori, stok, deskripsi, harga_perhari });
    res.status(201).json({ message: 'Alat berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function update(req, res) {
  try {
    const { nama_alat, id_kategori, stok, deskripsi, harga_perhari } = req.body;
    await alatService.updateAlat(req.params.id, { nama_alat, id_kategori, stok, deskripsi, harga_perhari });
    res.json({ message: 'Data alat berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function remove(req, res) {
  try {
    await alatService.deleteAlat(req.params.id);
    res.json({ message: 'Alat berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};