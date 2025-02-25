const emailStyles = `
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    font-family: 'Segoe UI', Arial, sans-serif;
    color: #ffffff;
    background-color: #222B4A;
  }
  .header {
    background: #212A49;
    padding: 30px 20px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    color: white;
  }
  .logo-container {
    text-align: center;
  }
  .logo {
    width: 75px;
    height: 75px;
    margin: 0 auto 15px auto;
    border-radius: 50%;
    padding: 8px;
    background: #3E5179;
    box-shadow: 
      0 0 0 2px #36486C,
      0 0 20px rgba(62, 81, 121, 0.3);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .logo:hover {
    transform: scale(1.05);
    box-shadow: 
      0 0 0 2px #36486C,
      0 0 25px rgba(62, 81, 121, 0.4);
  }
  .content {
    padding: 40px 30px;
    line-height: 1.6;
    background-color: #ffffff;
    border-radius: 8px;
    margin: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    color: #222B4A;
    text-align: center;
  }
  .footer {
    background-color: #212A49;
    padding: 20px;
    text-align: center;
    color: white;
    font-size: 14px;
  }
  .highlight {
    font-weight: bold;
    color: #36486C;
  }
  .support {
    font-size: 14px;
    color: #666;
    margin-top: 20px;
  }
  .support a {
    color: #3E5179;
    text-decoration: none;
    font-weight: bold;
  }
  .support a:hover {
    text-decoration: underline;
  }
  .social-links a {
    color: #ffffff;
    text-decoration: none;
    margin: 0 5px;
  }
  .social-links a:hover {
    text-decoration: underline;
  }
`;

exports.passwordUpdated = (email, name) => {
  return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Password Update Confirmation</title>
        <style>${emailStyles}</style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                Smile Computer Education
            </div>
            <div class="logo-container">
                <a href="https://smilecomputereducation.com">
                    <img class="logo" src="${process.env.LOGO_URL || "https://res.cloudinary.com/disl8qg3k/image/upload/v1740311235/smile-computer/z7utqflxrmuajm9kkdwj.png"}" 
                    alt="Smile Computer Education Logo">
                </a>
            </div>
            <div class="content">
                <h2>Password Updated Successfully</h2>
                <p>Hey ${name},</p>
                <p>Your password has been successfully updated for the email <span class="highlight">${email}</span>.</p>
                <p>If you did not request this password change, please contact us immediately to secure your account.</p>
                <p class="support">
                    If you have any questions or need further assistance, please feel free to reach out to us at 
                    <a href="mailto:support@smilecomputereducation.com">support@smilecomputereducation.com</a>. 
                    We are here to help!
                </p>
            </div>
            <div class="footer">
                <div class="social-links">
                    <a href="#">Facebook</a> |
                    <a href="#">Twitter</a> |
                    <a href="#">Instagram</a>
                </div>
                <div class="contact-info">
                    <p><strong>Smile Computer Education</strong></p>
                    <p>Old PSS College Building, Pauni - 441910</p>
                    <p>Phone: <a href="tel:8007261926" style="color: white;">8007261926</a></p>
                </div>
                <p>&copy; ${new Date().getFullYear()} Smile Computer Education. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;
};
