// controllers/fileController.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const folderName = req.body.folder || 'default';
      const dest = path.join(__dirname, '..', 'uploads', folderName);

      // Create folder if it doesn't exist
      fs.mkdirSync(dest, { recursive: true });

      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const originalExt = path.extname(file.originalname);
      const customName = req.body.filename || Date.now().toString();
      cb(null, customName + originalExt);
    }
  })
});

const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.status(200).json({
    message: 'File uploaded successfully',
    filePath: req.file.path,
    fileName: req.file.filename
  });
};

module.exports = { upload, uploadFile };
