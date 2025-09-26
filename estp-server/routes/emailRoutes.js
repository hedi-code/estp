const express = require("express");
const { sendInvoice, sendEmailWithAttachment, sendSimpleEmail } = require("../controllers/emailController");

const router = express.Router();

router.post("/send-invoice", sendInvoice);
router.post("/send-email", sendSimpleEmail);
router.post("/send-email-with-attachment", sendEmailWithAttachment);

module.exports = router;
