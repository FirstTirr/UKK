const logAktivitasService = require('../services/logAktivitasService');

async function getAll(req, res) {
  try {
    const data = await logAktivitasService.getAllLogAktivitas();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getAll
};
