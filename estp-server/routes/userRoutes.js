const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Assuming your controller file is in the 'controllers' folder

// Route to get user by ID
router.get('/:id', userController.getUserById);

// Route to create a new user
router.post('/', userController.createUser);

// Route to update the 'step' column only
router.put('/updateStep/:id', userController.updateStep);

module.exports = router;
