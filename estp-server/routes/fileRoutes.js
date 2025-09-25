const express = require('express');
const router = express.Router();
const { uploadHandler } = require('../controllers/fileController');

// Upload to dynamic folder like /api/upload/bc1 or /api/upload/img/pack1
router.post('/*', uploadHandler);

module.exports = router;
