const express = require('express');
const router = express.Router();
const option1Controller = require('../controllers/option1Controller');
const authMiddleware = require('../middleware/auth');

// Create a new option
router.post('/', authMiddleware, option1Controller.createOption1);

// Get all options
router.get('/',authMiddleware,  option1Controller.getAllOption1s);

// Get option by ID
router.get('/:id',authMiddleware,  option1Controller.getOption1ById);

// Update option by ID
router.put('/:id', authMiddleware, option1Controller.updateOption1);

// Delete option by ID
router.delete('/:id', authMiddleware, option1Controller.deleteOption1);

module.exports = router;
