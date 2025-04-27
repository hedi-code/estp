const express = require('express');
const router = express.Router();
const pack1sController = require('../controllers/pack1Controller');

router.get('/', pack1sController.getAllPack1sWithDetails);
module.exports = router;
