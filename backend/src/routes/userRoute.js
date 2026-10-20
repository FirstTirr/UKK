const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.use(verifyToken, checkRole(['admin']));

// Read -> /api/users/read
router.get('/read', userController.getAll);

// Create -> /api/users/
router.post('/', userController.create);

// Delete -> /api/users/delete/:id
router.delete('/delete/:id', userController.remove);

module.exports = router;