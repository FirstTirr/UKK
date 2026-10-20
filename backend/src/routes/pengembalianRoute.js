const express = require('express');
const router = express.Router();
const pengembalianController = require('../controllers/pengembalianController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Process Pengembalian -> PUT /api/pengembalian/:id
router.put('/:id', checkRole(['admin', 'petugas']), pengembalianController.processPengembalian);

module.exports = router;