const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Route to get all users with role = 'comm'
router.get('/commercials', authMiddleware, userController.getCommercials);

// Route to get all members (role <> 'user')
router.get('/members', authMiddleware, userController.getMembers);

// Route to get user by ID
router.get('/:id', authMiddleware, userController.getUserById);

// Route to create a new user
router.post('/', userController.createUser);

// Route to update the 'step' column only
router.put('/updateStep/:id', userController.updateStep);

// Route to update a member (first_name, last_name, email, role)
router.put('/members/:id', authMiddleware, userController.updateMember);

// Route to reset a member's password (president action)
router.put('/members/:id/reset-password', authMiddleware, userController.resetMemberPassword);

router.get('/', authMiddleware, userController.getAllUsers);

router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;
