const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const requirePresident = require('../middleware/requirePresident');
const requireStaff = require('../middleware/requireStaff');

// Route to get all users with role = 'comm'
router.get('/commercials', authMiddleware, requireStaff, userController.getCommercials);

// Route to get all members (role <> 'user')
router.get('/members', authMiddleware, requireStaff, userController.getMembers);

// Route to get all company registrations (role = 'user') — must stay BEFORE '/:id'
// Réservé à l'administrateur (président).
router.get('/inscriptions', authMiddleware, requirePresident, userController.getInscriptions);

// Route to manually validate a pending account — réservé à l'administrateur (président).
router.put('/:id/verify', authMiddleware, requirePresident, userController.verifyUser);

// Route to get user by ID
router.get('/:id', authMiddleware, requireStaff, userController.getUserById);

// Route to create a new user (ajout d'un membre par l'administrateur).
// Protégé : auth + président, pour empêcher toute création de compte (a fortiori admin) non authentifiée.
router.post('/', authMiddleware, requirePresident, userController.createUser);

// Route to update the 'step' column only
router.put('/updateStep/:id', userController.updateStep);

// Route to update a member (first_name, last_name, email, role)
router.put('/members/:id', authMiddleware, requireStaff, userController.updateMember);

// Route to reset a member's password (president action)
router.put('/members/:id/reset-password', authMiddleware, requirePresident, userController.resetMemberPassword);

router.get('/', authMiddleware, requireStaff, userController.getAllUsers);

router.delete('/:id', authMiddleware, requireStaff, userController.deleteUser);

module.exports = router;
