const nodemailer = require("nodemailer");

// Create email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  logger: true,
  debug: true,
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Failed:", error);
  } else {
    console.log("SMTP Server is Ready to Take Messages");
  }
});

// Enhanced email styles with Smile Computer Education branding
const emailStyles = `
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    font-family: 'Segoe UI', Arial, sans-serif;
    color: #333333;
    background-color: #f9f9f9;
  }
  .header {
    background:  #1A2544;
    padding: 30px 20px;
    text-align: center;
  }
.logo {
  width: 75px;
  height: 75px;
  margin-bottom: 15px;
  border-radius: 50%;
  padding: 8px;
  background: var(--text-light);
  box-shadow: 
    0 0 0 2px var(--primary-blue),
    0 0 20px rgba(79, 211, 224, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
  box-shadow: 
    0 0 0 2px var(--primary-blue),
    0 0 25px rgba(79, 211, 224, 0.4);
}
  .header h1 {
    color: white;
    margin: 0;
    font-size: 28px;
    font-weight: 600;
  }
  .content {
    padding: 40px 30px;
    line-height: 1.6;
    background-color: #ffffff;
    border-radius: 8px;
    margin: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .footer {
    background-color: #1A2544;
    padding: 20px;
    text-align: center;
    color: white;
    font-size: 14px;
  }
  .button {
    display: inline-block;
    padding: 12px 24px;
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    color: white;
    text-decoration: none;
    border-radius: 25px;
    margin: 20px 0;
    font-weight: 600;
    transition: transform 0.2s;
  }
  .button:hover {
    transform: translateY(-2px);
  }
  .otp-box {
    background-color: #f8f9fa;
    padding: 25px;
    border-radius: 10px;
    text-align: center;
    margin: 20px 0;
    border: 2px dashed #1e3c72;
  }
  .otp-code {
    font-size: 32px;
    letter-spacing: 8px;
    color: #1e3c72;
    font-weight: bold;
    padding: 10px;
    background: #fff;
    border-radius: 5px;
    display: inline-block;
  }
  .social-links {
    margin-top: 20px;
  }
  .social-links a {
    color: white;
    margin: 0 10px;
    text-decoration: none;
  }
  .contact-info {
    margin-top: 15px;
    font-size: 13px;
    color: #ffffff;
  }
`;

// Enhanced email template
const createEmailTemplate = (title, content) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${emailStyles}</style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="${
            process.env.LOGO_URL ||
            "https://res.cloudinary.com/disl8qg3k/image/upload/v1740311235/smile-computer/z7utqflxrmuajm9kkdwj.png"
          }" alt="Smile Computer Education" class="logo">
          <h1>${title}</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <div class="social-links">
            <a href="#">Facebook</a> |
            <a href="#">Twitter</a> |
            <a href="#">Instagram</a>
          </div>
          <div class="contact-info">
            <p>Smile Computer Education</p>
            <p>123 Education Street, Knowledge City</p>
            <p>Phone: +1234567890 | Email: info@smilecomputer.edu</p>
          </div>
          <p>&copy; ${new Date().getFullYear()} Smile Computer Education. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Helper functions
const generateOTP = () => {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < (process.env.OTP_LENGTH || 6); i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

const getOTPExpiry = () => {
  return new Date(Date.now() + (process.env.OTP_EXPIRE || 5) * 60 * 1000);
};

// Enhanced email sending function
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Smile Computer Education" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

// Enhanced email templates for different purposes
const sendOTPEmail = async (email, otp, type) => {
  const titles = {
    registration: "Welcome to Smile Computer Education",
    login: "Login Verification",
    reset: "Password Reset Request",
  };

  const content = `
    <h2>Dear Student,</h2>
    <div class="otp-box">
      <p>Your ${type} verification code is:</p>
      <div class="otp-code">${otp}</div>
      <p>This code will expire in ${process.env.OTP_EXPIRE || 5} minutes.</p>
    </div>
    <p>If you didn't request this code, please ignore this email or contact our support team.</p>
    <p>Best regards,<br>Smile Computer Education Team</p>
  `;

  return sendEmail(
    email,
    `${titles[type]} - Verification Code`,
    createEmailTemplate(titles[type], content)
  );
};

const sendRegistrationSuccessEmail = async (email, name) => {
  const content = `
    <h2>Dear ${name},</h2>
    <p>Welcome to Smile Computer Education! We're thrilled to have you join our community of learners.</p>
    <p>Your account has been successfully created and you now have access to our comprehensive learning resources.</p>
    <a href="${process.env.FRONTEND_URL}/login" class="button">Access Your Account</a>
    <p>If you have any questions or need assistance, our support team is always here to help.</p>
    <p>Happy Learning!<br>Smile Computer Education Team</p>
  `;

  return sendEmail(
    email,
    "Welcome to Smile Computer Education!",
    createEmailTemplate("Welcome Aboard!", content)
  );
};

const sendLoginSuccessEmail = async (email, name) => {
  const content = `
    <h2>Dear ${name},</h2>
    <p>We noticed a new login to your Smile Computer Education account at ${new Date().toLocaleString()}.</p>
    <p>If this wasn't you, please contact our support team immediately to secure your account.</p>
    <p>Best regards,<br>Smile Computer Education Security Team</p>
  `;

  return sendEmail(
    email,
    "New Login Alert - Smile Computer Education",
    createEmailTemplate("Security Alert", content)
  );
};

const sendPasswordResetSuccessEmail = async (email, name) => {
  const content = `
    <h2>Dear ${name},</h2>
    <p>Your password for Smile Computer Education account has been successfully reset at ${new Date().toLocaleString()}.</p>
    <p>You can now login to your account with your new password.</p>
    <a href="${process.env.FRONTEND_URL}/login" class="button">Login Now</a>
    <p>If you didn't make this change, please contact our support team immediately.</p>
    <p>Best regards,<br>Smile Computer Education Security Team</p>
  `;

  return sendEmail(
    email,
    "Password Reset Successful - Smile Computer Education",
    createEmailTemplate("Password Reset Confirmation", content)
  );
};

module.exports = {
  sendOTPEmail,
  generateOTP,
  getOTPExpiry,
  sendRegistrationSuccessEmail,
  sendLoginSuccessEmail,
  sendPasswordResetSuccessEmail,
};
