const express = require('express');
const router = express.Router();
const secteurController = require('../controllers/secteurController');
const authMiddleware = require('../middleware/auth');

router.get('/', secteurController.getAllSecteurs);
router.get('/:id', secteurController.getSecteurById);
router.post('/', authMiddleware, secteurController.createSecteur);
router.put('/:id', authMiddleware, secteurController.updateSecteur);
router.delete('/:id', authMiddleware, secteurController.deleteSecteur);

module.exports = router;
