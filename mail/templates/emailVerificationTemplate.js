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
  }
 .logo-container {
    text-align: center; /* Centers the logo */
}

.logo {
    width: 75px;
    height: 75px;
    margin: 0 auto 15px auto; /* Centers the logo */
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

  .header h1 {
    color: #ffffff;
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
    color: #222B4A;
  }
  .footer {
    background-color: #212A49;
    padding: 20px;
    text-align: center;
    color: white;
    font-size: 14px;
  }
  .button {
    display: inline-block;
    padding: 12px 24px;
    background: linear-gradient(135deg, #36486C 0%, #3E5179 100%);
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
    border: 2px dashed #36486C;
  }
  .otp-code {
    font-size: 32px;
    letter-spacing: 8px;
    color: #36486C;
    font-weight: bold;
    padding: 10px;
    background: #fff;
    border-radius: 5px;
    display: inline-block;
  }
`;

const otpTemplate = (otp) => {
  return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>OTP Verification - Smile Computer Education</title>
        <style>${emailStyles}</style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                MKCL Authorized Centre - 44210161
            </div>
            <div class="logo-container">
            <a href="https://smilecomputereducation.com">
                <img class="logo" src="https://res.cloudinary.com/disl8qg3k/image/upload/v1740311235/smile-computer/z7utqflxrmuajm9kkdwj.png" alt="Smile Computer Education Logo">
            </a>
            </div>
            <div class="content">
                <h2>OTP Verification - Smile Computer Education</h2>
                <p>Dear User,</p>
                <p>Thank you for registering with <strong>Smile Computer Education</strong>. To complete your registration, please use the following OTP (One-Time Password) to verify your account:</p>
                <div class="otp-box">
                    <span class="otp-code">${otp}</span>
                </div>
                <p>This OTP is valid for <strong>5 minutes</strong>. If you did not request this verification, please ignore this email.</p>
            </div>
            <div class="footer">
                <strong>Smile Computer Education, Pauni</strong> <br>
                Address: Old PSS College Building, Pauni - 441910 <br>
                Contact: Kamlesh Jambhulkar - <a href="tel:8007261926">8007261926</a> <br>
                <a href="https://smilecomputereducation.com">Visit our Website</a>
            </div>
        </div>
    </body>
    </html>`;
};

module.exports = otpTemplate;
