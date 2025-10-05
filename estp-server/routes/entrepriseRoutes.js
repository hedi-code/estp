const express = require('express');
const router = express.Router();
const entrepriseController = require('../controllers/entrepriseController');
const jwt = require('../middleware/auth');

// GET all entreprises
router.get('/', entrepriseController.getAllEntreprises);

// GET all entreprises with pack1s and place_plan (must be before /:id)
router.get('/with-pack1s/all', entrepriseController.getEntreprisesWithPack1s);

// GET entreprise by user ID (must be before /:id)
router.get('/user/:id', entrepriseController.getEntrepriseByUserId);

// GET one entreprise by ID
router.get('/:id', entrepriseController.getEntrepriseById);
// CREATE new entreprise
router.post('/', entrepriseController.createEntreprise);

// UPDATE entreprise
router.put('/:id', entrepriseController.updateEntreprise);

// UPDATE place_plan
router.put('/:id/place-plan', entrepriseController.updatePlacePlan);

// DELETE entreprise
router.delete('/:id', jwt, entrepriseController.deleteEntreprise);

module.exports = router;
