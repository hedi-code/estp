const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const jwt = require('../middleware/auth');


// Create a contact
router.post('/', contactController.createContact);

// Get all contacts
router.get('/', contactController.getAllContacts);

// Get a contact by ID
router.get('/:id', contactController.getContactById);
router.get('/user/:id', contactController.getContactByUserId);

// Update a contact by ID
router.put('/:id', jwt, contactController.updateContact);

// Delete a contact by ID
router.delete('/:id', jwt, contactController.deleteContact);

module.exports = router;
