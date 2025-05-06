const express = require('express');
const router = express.Router();
const option1Controller = require('../controllers/option1Controller');

// Create a new option
router.post('/', option1Controller.createOption1);

// Get all options
router.get('/', option1Controller.getAllOption1s);

// Get option by ID
router.get('/:id', option1Controller.getOption1ById);

// Update option by ID
router.put('/:id', option1Controller.updateOption1);

// Delete option by ID
router.delete('/:id', option1Controller.deleteOption1);

module.exports = router;