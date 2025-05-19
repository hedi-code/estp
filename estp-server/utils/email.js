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
 */
const sendEmail = async (
  senderEmail,
  receiverEmail,
  receiverName,
  subject,
  htmlText,
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
