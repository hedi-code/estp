const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Multer storage config with dynamic folder and filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = req.params.folder;
    const uploadDir = path.join(__dirname, '../uploads', folder);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const originalExt = path.extname(file.originalname); // keep original extension
    const requestedName = req.query.filename;
    const safeName = requestedName
      ? `${requestedName}${originalExt}`
      : `${Date.now()}-${file.originalname}`;
    cb(null, safeName);
  }
});

const upload = multer({ storage });

const uploadHandler = (req, res) => {
  upload.single('file')(req, res, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Upload failed', details: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const folder = req.params.folder;
    res.status(200).json({
      nonDisplayMessage: 'File uploaded successfully',
      filePath: `/uploads/${folder}/${req.file.filename}`
    });
  });
};

module.exports = {
  uploadHandler
};
