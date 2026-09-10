const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const authMiddleware = require('../middleware/auth');
const requirePresident = require('../middleware/requirePresident');

// Lecture : ouverte à tout compte authentifié (les entreprises lisent les dates
// pour les factures / pages d'info).
router.get('/', authMiddleware, configController.getAllConfigs);

// Get config by name
router.get('/:configName', authMiddleware, configController.getConfigByName);

// Écriture : réservée au président (sinon n'importe quel compte authentifié
// pourrait modifier édition, dates, préfixe de facture via l'API).
router.put('/:id', authMiddleware, requirePresident, configController.updateConfig);

// Upload config file (président uniquement également).
router.post('/upload', authMiddleware, requirePresident, configController.uploadConfigFile, configController.handleConfigFileUpload);

module.exports = router;
