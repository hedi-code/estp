const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const authMiddleware = require('../middleware/auth');

// Get all configs
router.get('/', authMiddleware, configController.getAllConfigs);

// Get config by name
router.get('/:configName', authMiddleware, configController.getConfigByName);

// Update config
router.put('/:id', authMiddleware, configController.updateConfig);

// Upload config file
router.post('/upload', authMiddleware, configController.uploadConfigFile, configController.handleConfigFileUpload);

module.exports = router;
