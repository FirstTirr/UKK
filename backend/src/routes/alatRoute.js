const express = require('express');
const router = express.Router();
const alatController = require('../controllers/alatController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Read -> /api/alat/read
router.get('/read', alatController.getAll);

// Read -> /api/alat/read/:id
router.get('/read/:id', alatController.getById);

// Create -> /api/alat/
router.post('/', checkRole(['admin', 'petugas']), alatController.create);

// Edit -> /api/alat/edit/:id
router.put('/edit/:id', checkRole(['admin', 'petugas']), alatController.update);

// Delete -> /api/alat/delete/:id
router.delete('/delete/:id', checkRole(['admin']), alatController.remove);

module.exports = router;