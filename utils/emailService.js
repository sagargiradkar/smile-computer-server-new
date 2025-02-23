const nodemailer = require('nodemailer');

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
  /* Brand Colors */
:root {
  --primary-blue: #42C9D1;      /* Turquoise blue from logo */
  --secondary-blue: #1E2A4A;    /* Dark navy background */
  --accent-blue: #34A5AB;       /* Darker shade of primary for hover states */
  --text-dark: #1A1A1A;
  --text-light: #FFFFFF;
  --background-light: #F9F9F9;
  --shadow-color: rgba(66, 201, 209, 0.1);
}

.email-container {
  max-width: 600px;
  margin: 0 auto;
  font-family: 'Segoe UI', Arial, sans-serif;
  color: var(--text-dark);
  background-color: var(--background-light);
}

.header {
  background: linear-gradient(135deg, var(--secondary-blue) 0%, var(--primary-blue) 100%);
  padding: 30px 20px;
  text-align: center;
  border-radius: 0 0 20px 20px;
}

.logo {
  width: 150px;
  height: auto;
  margin-bottom: 15px;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.header h1 {
  color: var(--text-light);
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.content {
  padding: 40px 30px;
  line-height: 1.6;
  background-color: var(--text-light);
  border-radius: 15px;
  margin: 20px;
  box-shadow: 0 4px 15px var(--shadow-color);
}

.footer {
  background-color: var(--secondary-blue);
  padding: 20px;
  text-align: center;
  color: var(--text-light);
  font-size: 14px;
  border-radius: 20px 20px 0 0;
}

.button {
  display: inline-block;
  padding: 12px 24px;
  background: var(--primary-blue);
  color: var(--text-light);
  text-decoration: none;
  border-radius: 25px;
  margin: 20px 0;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px var(--shadow-color);
}

.button:hover {
  background: var(--accent-blue);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--shadow-color);
}

.otp-box {
  background-color: var(--background-light);
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  margin: 20px 0;
  border: 2px dashed var(--primary-blue);
  box-shadow: inset 0 0 15px var(--shadow-color);
}

.otp-code {
  font-size: 32px;
  letter-spacing: 8px;
  color: var(--primary-blue);
  font-weight: bold;
  padding: 15px;
  background: var(--text-light);
  border-radius: 10px;
  display: inline-block;
  box-shadow: 0 2px 10px var(--shadow-color);
}

.social-links {
  margin-top: 20px;
}

.social-links a {
  color: var(--text-light);
  margin: 0 10px;
  text-decoration: none;
  transition: color 0.3s ease;
}

.social-links a:hover {
  color: var(--primary-blue);
}

.contact-info {
  margin-top: 15px;
  font-size: 13px;
  color: var(--text-light);
  opacity: 0.9;
}

/* Responsive Design */
@media (max-width: 600px) {
  .email-container {
    margin: 10px;
  }
  
  .content {
    padding: 20px 15px;
    margin: 10px;
  }
  
  .header h1 {
    font-size: 24px;
  }
  
  .otp-code {
    font-size: 24px;
    letter-spacing: 6px;
  }
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
          <img src="${process.env.LOGO_URL || 'https://res.cloudinary.com/disl8qg3k/image/upload/v1740311235/smile-computer/z7utqflxrmuajm9kkdwj.png'}" alt="Smile Computer Education" class="logo">
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

// Enhanced email sending function
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Smile Computer Education" <${process.env.EMAIL_USER}>`,
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

// Enhanced email templates for different purposes
const sendOTPEmail = async (email, otp, type) => {
  const titles = {
    registration: 'Welcome to Smile Computer Education',
    login: 'Login Verification',
    reset: 'Password Reset Request'
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

  return sendEmail(email, `${titles[type]} - Verification Code`, createEmailTemplate(titles[type], content));
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

  return sendEmail(email, "Welcome to Smile Computer Education!", createEmailTemplate("Welcome Aboard!", content));
};

const sendLoginSuccessEmail = async (email, name) => {
  const content = `
    <h2>Dear ${name},</h2>
    <p>We noticed a new login to your Smile Computer Education account at ${new Date().toLocaleString()}.</p>
    <p>If this wasn't you, please contact our support team immediately to secure your account.</p>
    <p>Best regards,<br>Smile Computer Education Security Team</p>
  `;

  return sendEmail(email, "New Login Alert - Smile Computer Education", createEmailTemplate("Security Alert", content));
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

  return sendEmail(email, "Password Reset Successful - Smile Computer Education", createEmailTemplate("Password Reset Confirmation", content));
};

module.exports = {
  sendOTPEmail,
  generateOTP,
  getOTPExpiry,
  sendRegistrationSuccessEmail,
  sendLoginSuccessEmail,
  sendPasswordResetSuccessEmail
};
