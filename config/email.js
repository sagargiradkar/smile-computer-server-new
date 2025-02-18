const nodemailer = require("nodemailer"); // Nodemailer for handling emails

// Email configuration using environment variables for security
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // 'gmail', 'hotmail', etc. (from .env)
  auth: {
    user: process.env.EMAIL_USER,     // Sender email address
    pass: process.env.EMAIL_PASS      // Sender email password or app password
  }
});

// Function to send emails
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: `"College Placement Cell" <${process.env.EMAIL_USER}>`, // Display name with sender email
      to: to,            // Recipient email
      subject: subject,  // Subject of the email
      html: htmlContent  // HTML body of the email
    };

    const info = await transporter.sendMail(mailOptions); // Send email
    console.log(`Email sent: ${info.response}`); // Log success response
    return true; // Success
  } catch (error) {
    console.error(`Error sending email: ${error.message}`); // Log error if any
    return false; // Failure
  }
};

module.exports = sendEmail; // Export sendEmail for use in controllers or other modules
