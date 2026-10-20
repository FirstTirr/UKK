const express = require('express');
const router = express.Router();
const peminjamanController = require('../controllers/peminjamanController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Read All -> /api/peminjaman/read
router.get('/read', peminjamanController.getAll);

// Read By ID -> /api/peminjaman/read/:id
router.get('/read/:id', peminjamanController.getById);

// Create Peminjaman -> /api/peminjaman/
router.post('/', peminjamanController.create);

// Validasi / Persetujuan -> /api/peminjaman/validasi/:id
router.put('/validasi/:id', checkRole(['admin', 'petugas']), peminjamanController.setujui);

module.exports = router;