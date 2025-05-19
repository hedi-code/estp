const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();
const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.EMAIL_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Sends a transactional email using Brevo
 * @param {string} senderEmail - The sender's email address
 * @param {string} receiverEmail - The receiver's email address
 * @param {string} receiverName - The receiver's name
 * @param {string} subject - The subject of the email
 * @param {string} htmlText - The HTML content of the email
 * @param {Array} [ccEmails=null] - The email addresses of CC recipients (optional)
 * @param {string} [attachmentName=null] - The name of the attachment (optional)
 * @param {string} [attachment=null] - The Base64 encoded attachment content (optional)
 */
const sendEmail = async (
  senderEmail,
  receiverEmail,
  receiverName,
  subject,
  htmlText,
    ccEmails = null, // Default is null, meaning no CC unless provided
  attachmentName = null,
  attachment = null
) => {
  const sendSmtpEmail = {
    sender: { email: senderEmail },
    to: [{ email: receiverEmail, name: receiverName }],
    subject: subject,
    htmlContent: htmlText,
    headers: {
      'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
    }
  };
  if (ccEmails && Array.isArray(ccEmails) && ccEmails.length > 0) {
    sendSmtpEmail.cc = ccEmails.map(email => ({ email }));
  }
  // Add attachment only if both name and content are provided
  if (attachmentName && attachment) {
    sendSmtpEmail.attachment = [{
      name: attachmentName,
      content: attachment,
    }];
  }

  return apiInstance.sendTransacEmail(sendSmtpEmail)
    .then(data => {
      console.log('Email sent successfully:', data);
      return data;
    })
    .catch(error => {
      console.error('Error sending email:', error);
      throw error;
    });
};


module.exports = { sendEmail };
