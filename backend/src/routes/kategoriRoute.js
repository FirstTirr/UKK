const express = require('express');
const router = express.Router();
const kategoriController = require('../controllers/kategoriController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Read -> /api/kategori/read
router.get('/read', kategoriController.getAll);

// Create -> /api/kategori/
router.post('/', checkRole(['admin']), kategoriController.create);

// Edit -> /api/kategori/edit/:id
router.put('/edit/:id', checkRole(['admin']), kategoriController.update);

// Delete -> /api/kategori/delete/:id
router.delete('/delete/:id', checkRole(['admin']), kategoriController.remove);

module.exports = router;