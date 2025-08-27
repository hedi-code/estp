const express = require("express");
const { sendInvoice, sendEmailWithAttachment } = require("../controllers/emailController");

const router = express.Router();

router.post("/send-invoice", sendInvoice);
router.post("/send-email-with-attachment", sendEmailWithAttachment);

module.exports = router;
