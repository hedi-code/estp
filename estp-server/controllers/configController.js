const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/config');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Keep original filename
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  }
});

// Get all configs
exports.getAllConfigs = (req, res) => {
  const query = 'SELECT * FROM config ORDER BY config_name';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error getting configs:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

// Get config by name
exports.getConfigByName = (req, res) => {
  const { configName } = req.params;
  const query = 'SELECT * FROM config WHERE config_name = ?';

  db.query(query, [configName], (err, results) => {
    if (err) {
      console.error('Error getting config:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Config not found' });
    }
    res.json(results[0]);
  });
};

// Update config
exports.updateConfig = (req, res) => {
  const { id } = req.params;
  const { config_value, description } = req.body;

  const query = 'UPDATE config SET config_value = ?, description = ? WHERE id = ?';

  db.query(query, [config_value, description, id], (err, result) => {
    if (err) {
      console.error('Error updating config:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Config not found' });
    }
    res.json({ message: 'Config updated successfully' });
  });
};

// Upload config file
exports.uploadConfigFile = upload.single('file');

exports.handleConfigFileUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    message: 'File uploaded successfully',
    filename: req.file.originalname
  });
};
