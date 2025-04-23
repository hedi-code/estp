const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = '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';

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Sends a transactional email using Brevo
 * @param {string} senderEmail - The sender's email address
 * @param {string} receiverEmail - The receiver's email address
 * @param {string} receiverName - The receiver's name
 * @param {string} subject - The subject of the email
 * @param {string} htmlText - The HTML content of the email
 */
const sendEmail = async(senderEmail, receiverEmail, receiverName, subject, htmlText) => {
    const sendSmtpEmail = {
        sender: { email: senderEmail },
        to: [{ email: receiverEmail, name: receiverName }],
        subject: subject,
        htmlContent: htmlText,
        headers: {
            'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
        }
    };

    return apiInstance.sendTransacEmail(sendSmtpEmail)
        .then(data => {
            console.log('Email sent successfully:', data);
            return data;
        })
        .catch(error => {
            console.error('Error sending email:', error);
            throw error;
        });
}

module.exports = { sendEmail };
