const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { sendEmail } = require('./../utils/email');

// Helper to wait for file generation (optional)
const waitForFile = (filePath, timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (fs.existsSync(filePath)) {
        clearInterval(interval);
        resolve(true);
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(new Error('Timeout waiting for file'));
      }
    }, 500);
  });
};

exports.sendInvoice = (req, res) => {
  const {
    senderEmail,
    receiverEmail,
    receiverName,
    subject,
    htmlText,
    ccEmails,
    attachmentName
  } = req.body;

  // Step 1: Check that required fields exist
  if (!senderEmail || !receiverEmail || !receiverName || !subject || !htmlText) {
    return res.status(400).json({ error: "Champs requis manquants." });
  }

  // Step 2: Build full path to the attachment
  const attachmentPath = path.join(__dirname, '../uploads/facture/', attachmentName);

  // Step 3: Wait for the file to exist (optional, depends on generation delay)
  waitForFile(attachmentPath, 20000)
    .then(() => {
      // Step 4: Read and convert the file to base64
      const attachmentBuffer = fs.readFileSync(attachmentPath);
      const base64Attachment = attachmentBuffer.toString('base64');

      // Step 5: Send email
      return sendEmail(
        senderEmail,
        receiverEmail,
        receiverName,
        subject,
        htmlText,
        ccEmails,
        attachmentName,
        base64Attachment
      );
    })
    .then((result) => {
      // Step 6: Respond with success
      res.status(200).json({ message: "Facture envoyée avec succès", result });
    })
    .catch((err) => {
      // Step 7: Handle errors (file not found or sendEmail failed)
      console.error("Erreur envoi facture:", err);
      res.status(500).json({ error: "Échec de l'envoi de la facture", details: err.message });
    });
};
const upload = multer({ dest: 'uploads/tmp/' });

exports.sendEmailWithAttachment = [
  upload.single('file'),
  async (req, res) => {
    try {
      const {
        senderEmail,
        receiverEmail,
        receiverName,
        subject,
        htmlText,
        ccEmails
      } = req.body;

      if (!senderEmail || !receiverEmail || !receiverName || !subject || !htmlText) {
        return res.status(400).json({ error: "Champs requis manquants." });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier fourni." });
      }

      const filePath = req.file.path;
      const fileBuffer = fs.readFileSync(filePath);
      const base64Attachment = fileBuffer.toString('base64');
      const attachmentName = req.file.originalname;

      const result = await sendEmail(
        senderEmail,
        receiverEmail,
        receiverName,
        subject,
        htmlText,
        ccEmails,
        attachmentName,
        base64Attachment
      );

      // Nettoyage du fichier temporaire
      fs.unlinkSync(filePath);

      return res.status(200).json({ message: "Email avec pièce jointe envoyé avec succès", result });
    } catch (err) {
      console.error("Erreur envoi email avec pièce jointe:", err);
      return res.status(500).json({ error: "Échec de l'envoi de l'email", details: err.message });
    }
  }
];