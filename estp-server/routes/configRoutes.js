const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

// Get all configs
router.get('/', configController.getAllConfigs);

// Get config by name
router.get('/:configName', configController.getConfigByName);

// Update config
router.put('/:id', configController.updateConfig);

// Upload config file
router.post('/upload', configController.uploadConfigFile, configController.handleConfigFileUpload);

module.exports = router;
