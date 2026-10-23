const express = require('express');
const router = express.Router();
const logAktivitasController = require('../controllers/logAktivitasController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Log aktivitas bersifat audit — hanya admin yang boleh membaca
router.use(verifyToken, checkRole(['admin']));

// Read -> /api/log-aktivitas/read
router.get('/read', logAktivitasController.getAll);

module.exports = router;
