const express = require('express');
const router = express.Router();
const exposantController = require('../controllers/exposantController');

// Route to get all exposants with entreprise info
router.get('/with-entreprise', exposantController.getAllExposantsWithEntreprise);

// Route to get all exposants
router.get('/', exposantController.getAllExposants);

// Route to get exposants by entreprise_id
router.get('/entreprise/:entreprise_id', exposantController.getExposantsByEntreprise);

// Route to get exposant by ID
router.get('/:id', exposantController.getExposantById);

// Route to create a new exposant
router.post('/', exposantController.createExposant);

// Route to update an exposant
router.put('/:id', exposantController.updateExposant);

// Route to delete an exposant
router.delete('/:id', exposantController.deleteExposant);

module.exports = router;
