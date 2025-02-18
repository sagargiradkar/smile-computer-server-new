const nodemailer = require("nodemailer");

/**
 * @desc Create an email transporter using Nodemailer
 * @returns {Object} Nodemailer transporter object
 */
const createTransporter = () => {
  if (!process.env.EMAIL_SERVICE || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email configuration is missing. Ensure EMAIL_SERVICE, EMAIL_USER, and EMAIL_PASS are set in the environment variables.");
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // E.g., 'gmail', 'outlook'
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
  });
};

/**
 * @desc Send an email notification
 * @param {String} to - Recipient's email address
 * @param {String} subject - Subject of the email
 * @param {String} text - Plain text version of the email content
 * @param {String} html - HTML version of the email content (optional)
 * @returns {Promise} Promise that resolves when the email is sent
 */
const sendEmail = async (to, subject, text, html = null) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender's email address (from your app)
    to: to, // Recipient's email address
    subject: subject, // Subject of the email
    text: text, // Plain text content
    html: html, // HTML content (optional)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
    return info;
  } catch (error) {
    console.error(`Error while sending email: ${error.message}`);
    throw error;
  }
};

module.exports = {
  sendEmail,
};
