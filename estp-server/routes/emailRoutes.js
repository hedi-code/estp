const express = require("express");
const { sendInvoice, sendEmailWithAttachment, sendSimpleEmail } = require("../controllers/emailController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/send-invoice", authMiddleware, sendInvoice);
router.post("/send-email", sendSimpleEmail);
router.post("/send-email-with-attachment", sendEmailWithAttachment);

module.exports = router;
