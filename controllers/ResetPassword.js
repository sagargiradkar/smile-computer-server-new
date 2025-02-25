const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { resetPasswordEmail } = require("../mail/templates/resetPasswordEmail");
const {
  resetPasswordSuccessEmail,
} = require("../mail/templates/resetPasswordSuccessEmail");

exports.resetPasswordToken = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
      });
    }
    const token = crypto.randomBytes(20).toString("hex");

    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 3600000,
      },
      { new: true }
    );
    console.log("DETAILS", updatedDetails);
    console.log("Token :: ", token);
    // const url = `https://studynotion.fun/update-password/${token}`;

    // await mailSender(email, "Password Reset", resetPasswordEmail(url, email));

    res.json({
      success: true,
	  token,
      message:
        "Token Sent Successfully",
    });
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      message: `Some Error in Sending the Reset Message`,
    });
  }
};

exports.resetPassword = async (req, res) => {
	try {
	  const { password, confirmPassword, token } = req.body;
  
	  if (confirmPassword !== password) {
		return res.status(400).json({
		  success: false,
		  message: "Password and Confirm Password do not match",
		});
	  }
  
	  const userDetails = await User.findOne({ token: token });
	  if (!userDetails) {
		return res.status(400).json({
		  success: false,
		  message: "Invalid token",
		});
	  }
  
	  if (!(userDetails.resetPasswordExpires > Date.now())) {
		return res.status(403).json({
		  success: false,
		  message: "Token expired. Please regenerate your token.",
		});
	  }
  
	  // Encrypt and update password
	  const encryptedPassword = await bcrypt.hash(password, 10);
	  await User.findOneAndUpdate(
		{ token: token },
		{ password: encryptedPassword, token: null, resetPasswordExpires: null },
		{ new: true }
	  );
  
	  // Send success email
	  const email = userDetails.email;
	  console.log("user details ",userDetails)
	  await mailSender(email, "Password Reset Successful", resetPasswordSuccessEmail(userDetails.firstName));
  
	  res.status(200).json({
		success: true,
		message: "Password reset successful",
	  });
	} catch (error) {
	  return res.status(500).json({
		success: false,
		message: "An error occurred while resetting the password",
		error: error.message,
	  });
	}
  };
