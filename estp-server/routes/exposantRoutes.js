const express = require('express');
const router = express.Router();
const exposantController = require('../controllers/exposantController');
const authMiddleware = require('../middleware/auth');

// Route to get all exposants with entreprise info
router.get('/with-entreprise', authMiddleware, exposantController.getAllExposantsWithEntreprise);

// Route to get all exposants
router.get('/', authMiddleware, exposantController.getAllExposants);

// Route to get exposants by entreprise_id
router.get('/entreprise/:entreprise_id', authMiddleware, exposantController.getExposantsByEntreprise);

// Route to get exposant by ID
router.get('/:id', authMiddleware, exposantController.getExposantById);

// Route to create a new exposant
router.post('/', authMiddleware, exposantController.createExposant);

// Route to update an exposant
router.put('/:id', authMiddleware, exposantController.updateExposant);

// Route to delete an exposant
router.delete('/:id', authMiddleware, exposantController.deleteExposant);

module.exports = router;
