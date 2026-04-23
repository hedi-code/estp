const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Route to get all users with role = 'comm'
router.get('/commercials', authMiddleware, userController.getCommercials);
// Route to get user by ID
router.get('/:id', authMiddleware, userController.getUserById);

// Route to create a new user
router.post('/', userController.createUser);

// Route to update the 'step' column only
router.put('/updateStep/:id', userController.updateStep);

router.get('/', authMiddleware, userController.getAllUsers);

router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;
