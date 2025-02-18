const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Common email styles
const emailStyles = `
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    font-family: Arial, sans-serif;
    color: #333333;
  }
  .header {
    background-color: #4CAF50;
    padding: 20px;
    text-align: center;
    color: white;
  }
  .content {
    padding: 20px;
    line-height: 1.6;
    background-color: #ffffff;
  }
  .footer {
    background-color: #f5f5f5;
    padding: 15px;
    text-align: center;
    font-size: 12px;
  }
  .button {
    display: inline-block;
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    margin: 15px 0;
  }
  .otp-box {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 5px;
    text-align: center;
    margin: 15px 0;
  }
  .otp-code {
    font-size: 24px;
    letter-spacing: 5px;
    color: #3498db;
    font-weight: bold;
  }
`;

// Create email template
const createEmailTemplate = (title, content) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${emailStyles}</style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>This is an automated message from ${process.env.APP_NAME || 'Our Platform'}.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Helper functions
const generateOTP = () => {
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < (process.env.OTP_LENGTH || 6); i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

const getOTPExpiry = () => {
  return new Date(Date.now() + (process.env.OTP_EXPIRE || 5) * 60 * 1000);
};

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Student Portal'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

// Email sending functions
const sendOTPEmail = async (email, otp, type) => {
  const titles = {
    registration: 'Email Verification',
    login: 'Login Authentication',
    reset: 'Password Reset Request'
  };

  const content = `
    <h2>Hello,</h2>
    <div class="otp-box">
      <p>Your ${type} OTP is:</p>
      <div class="otp-code">${otp}</div>
      <p>This OTP will expire in ${process.env.OTP_EXPIRE || 5} minutes.</p>
    </div>
    <p>If you didn't request this ${type}, please ignore this email or contact support.</p>
  `;

  return sendEmail(email, `${titles[type]} - ${process.env.APP_NAME}`, createEmailTemplate(titles[type], content));
};

const sendRegistrationSuccessEmail = async (email, name) => {
  const content = `
    <h2>Hello ${name},</h2>
    <p>Welcome to our platform! Your account has been successfully created.</p>
    <p>You can now access all features of your account.</p>
    <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Your Account</a>
  `;

  return sendEmail(email, "Welcome to Our Platform!", createEmailTemplate("Registration Successful", content));
};

const sendLoginSuccessEmail = async (email, name) => {
  const content = `
    <h2>Hello ${name},</h2>
    <p>We detected a new login to your account at ${new Date().toLocaleString()}.</p>
    <p>If this wasn't you, please secure your account immediately.</p>
  `;

  return sendEmail(email, "New Login Alert", createEmailTemplate("Security Notification", content));
};

const sendPasswordResetSuccessEmail = async (email, name) => {
  const content = `
    <h2>Hello ${name},</h2>
    <p>Your password has been successfully reset at ${new Date().toLocaleString()}.</p>
    <p>If you didn't make this change, please contact support immediately.</p>
  `;

  return sendEmail(email, "Password Reset Successful", createEmailTemplate("Password Reset Confirmation", content));
};

module.exports = {
  sendOTPEmail,
  generateOTP,
  getOTPExpiry,
  sendRegistrationSuccessEmail,
  sendLoginSuccessEmail,
  sendPasswordResetSuccessEmail
};
