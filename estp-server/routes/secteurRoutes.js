const express = require('express');
const router = express.Router();
const secteurController = require('../controllers/secteurController');

router.get('/', secteurController.getAllSecteurs);
router.get('/:id', secteurController.getSecteurById);
router.post('/', secteurController.createSecteur);
router.put('/:id', secteurController.updateSecteur);
router.delete('/:id', secteurController.deleteSecteur);

module.exports = router;
