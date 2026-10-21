const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Profil milik sendiri (semua role) — didaftarkan sebelum guard admin
router.get('/profil', verifyToken, userController.getProfil);
router.put('/profil', verifyToken, userController.updateProfil);

router.use(verifyToken, checkRole(['admin']));

// Read -> /api/users/read
router.get('/read', userController.getAll);

// Create -> /api/users/
router.post('/', userController.create);

// Delete -> /api/users/delete/:id
router.delete('/delete/:id', userController.remove);

module.exports = router;