const express = require('express');
const router = express.Router();
const entrepriseController = require('../controllers/entrepriseController');
const jwt = require('../middleware/auth');

// GET all entreprises
router.get('/', entrepriseController.getAllEntreprises);

// GET one entreprise by ID
router.get('/:id', entrepriseController.getEntrepriseById);

router.get('/user/:id', entrepriseController.getEntrepriseByUserId);
// CREATE new entreprise
router.post('/', entrepriseController.createEntreprise);

// UPDATE entreprise
router.put('/:id', entrepriseController.updateEntreprise);

// DELETE entreprise
router.delete('/:id', jwt, entrepriseController.deleteEntreprise);

module.exports = router;
