// routes/pack1sRoutes.js
const express = require('express');
const router = express.Router();
const pack1sController = require('../controllers/pack1Controller');

// Pack1
router.get('/', pack1sController.getAllPack1sWithDetails);
router.post('/', pack1sController.createPack1);
router.put('/pack/:id', pack1sController.updatePack1);
router.delete('/:id', pack1sController.deletePack1);

// Options
router.post('/pack/options', pack1sController.createOption);
router.put('/pack/options/:id', pack1sController.updateOption);
router.delete('/pack/options/:id', pack1sController.deleteOption);

// Surfaces
router.post('/pack/surfaces', pack1sController.createSurface);
router.put('/pack/surfaces/:id', pack1sController.updateSurface);
router.delete('/pack/surfaces/:id', pack1sController.deleteSurface);

module.exports = router;
