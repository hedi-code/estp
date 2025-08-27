// routes/pack1sRoutes.js
const express = require('express');
const router = express.Router();
const pack1sController = require('../controllers/pack1Controller');

// Pack1
router.get('/', pack1sController.getAllPack1sWithDetails);
router.put('/pack/:id', pack1sController.updatePack1);
router.delete('/:id', pack1sController.deletePack1);

// Options
router.put('/pack/options/:id', pack1sController.updateOption);
router.delete('/pack/options/:id', pack1sController.deleteOption);

// Surfaces
router.put('/pack/surfaces/:id', pack1sController.updateSurface);
router.delete('/pack/surfaces/:id', pack1sController.deleteSurface);

module.exports = router;
