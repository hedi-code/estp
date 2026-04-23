// routes/pack1sRoutes.js
const express = require('express');
const router = express.Router();
const pack1sController = require('../controllers/pack1Controller');
const authMiddleware = require('../middleware/auth');

// Pack1
router.get('/', authMiddleware, pack1sController.getAllPack1sWithDetails);
router.post('/', authMiddleware, pack1sController.createPack1);
router.put('/pack/:id', authMiddleware, pack1sController.updatePack1);
router.delete('/:id', authMiddleware, pack1sController.deletePack1);

// Options
router.post('/pack/options', authMiddleware, pack1sController.createOption);
router.put('/pack/options/:id', authMiddleware, pack1sController.updateOption);
router.delete('/pack/options/:id', authMiddleware, pack1sController.deleteOption);

// Surfaces
router.post('/pack/surfaces', authMiddleware, pack1sController.createSurface);
router.put('/pack/surfaces/:id', authMiddleware, pack1sController.updateSurface);
router.delete('/pack/surfaces/:id', authMiddleware, pack1sController.deleteSurface);

module.exports = router;
