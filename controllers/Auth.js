const bcrypt = require("bcrypt");
const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const {registrationSuccessTemplate} = require("../mail/templates/registrationSuccessTemplate");
const {loginSuccessTemplate} = require("../mail/templates/loginSuccessTemplate")
const Profile = require("../models/Profile");
require("dotenv").config();

// Signup Controller for Registering USers

exports.signup = async (req, res) => {	
	try {
		// Destructure request body
		const {
			firstName,
			lastName,
			email,
			password,
			confirmPassword,
			accountType,
			contactNumber,
			otp,
		} = req.body;

		// Validate required fields
		if (
			!firstName ||
			!lastName ||
			!email ||
			!password ||
			!confirmPassword ||
			!otp ||
			!contactNumber
		) {
			return res.status(403).json({
				success: false,
				message: "All fields are required",
			});
		}

		// Validate contact number format (10-digit number)
		if (!/^\d{10}$/.test(contactNumber)) {
			return res.status(400).json({
				success: false,
				message: "Invalid contact number format. Please enter a 10-digit number.",
			});
		}

		// Password match check
		if (password !== confirmPassword) {
			return res.status(400).json({
				success: false,
				message: "Passwords do not match. Please try again.",
			});
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "User already exists. Please sign in.",
			});
		}

		// Verify OTP
		const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
		if (response.length === 0 || otp !== response[0].otp) {
			return res.status(400).json({
				success: false,
				message: "Invalid OTP",
			});
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user profile with contactNumber
		const profileDetails = await Profile.create({
			gender: null,
			dateOfBirth: null,
			about: null,
			contactNumber, // Store contact number in profile
		});

		// Create user
		const user = await User.create({
			firstName,
			lastName,
			email,
			password: hashedPassword,
			accountType,
			contactNumber, // Also store in User schema if needed
			approved: accountType === "Instructor" ? false : true,
			additionalDetails: profileDetails._id,
			image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}&backgroundColor=00897b,00acc1,039be5,1e88e5,3949ab,43a047,5e35b1,7cb342,8e24aa,c0ca33,d81b60,e53935,f4511e,fb8c00,fdd835,ffb300,ffd5dc,ffdfbf,c0aede,d1d4f9,b6e3f4&backgroundType=solid,gradientLinear&backgroundRotation=0,360,-350,-340,-330,-320&fontFamily=Arial&fontWeight=600`,
		});

		// Send Registration Success Email
		try {
			const emailResponse = await mailSender(
				email,
				"Welcome to Smile Computer Education!",
				registrationSuccessTemplate(firstName)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (emailError) {
			console.error("Error sending email:", emailError);
		}

		// Generate JWT token (Move token declaration here)
		const token = jwt.sign(
			{ email: user.email, id: user._id, accountType: user.accountType },
			process.env.JWT_SECRET,
			{
				expiresIn: "24h",
			}
		);

		// Save token to user document
		user.token = token;
		user.password = undefined;

		// Set cookie for token
		const options = {
			expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
			httpOnly: true,
		};

		res.cookie("token", token, options);

		return res.status(200).json({
			success: true,
			user,
			token,
			message: "User registered successfully. A confirmation email has been sent.",
		});
	} catch (error) {
		console.error("Signup Error:", error);
		return res.status(500).json({
			success: false,
			message: "User registration failed. Please try again.",
		});
	}
};




// Login controller for authenticating users
exports.login = async (req, res) => {
	try {
		// Get email and password from request body
		const { email, password } = req.body;

		// Check if email or password is missing
		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: `Please fill up all the required fields.`,
			});
		}

		// Find user with provided email
		const user = await User.findOne({ email }).populate("additionalDetails");

		// If user not found
		if (!user) {
			return res.status(401).json({
				success: false,
				message: `User is not registered. Please sign up to continue.`,
			});
		}

		// Compare password
		if (await bcrypt.compare(password, user.password)) {
			// Generate JWT token
			const token = jwt.sign(
				{ email: user.email, id: user._id, accountType: user.accountType },
				process.env.JWT_SECRET,
				{
					expiresIn: "24h",
				}
			);

			// Save token to user document
			user.token = token;
			user.password = undefined;

			// Set cookie for token and return success response
			const options = {
				expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
				httpOnly: true,
			};
			res.cookie("token", token, options).status(200).json({
				success: true,
				token,
				user,
				message: `User login successful.`,
			});

			// Send login success email
			try {
				const emailResponse = await mailSender(
					email,
					"Smile Computer Education - Login Successful",
					loginSuccessTemplate(user.firstName)
				);
				console.log("Login email sent successfully:", emailResponse.response);
			} catch (emailError) {
				console.error("Error sending login email:", emailError);
			}
		} else {
			return res.status(401).json({
				success: false,
				message: `Password is incorrect.`,
			});
		}
	} catch (error) {
		console.error("Login Error:", error);
		return res.status(500).json({
			success: false,
			message: `Login failed. Please try again.`,
		});
	}
};
// Send OTP For Email Verification
exports.sendotp = async (req, res) => {
	try {
		const { email } = req.body;

		// Check if user is already present
		// Find user with provided email
		const checkUserPresent = await User.findOne({ email });
		// to be used in case of signup

		// If user found with provided email
		if (checkUserPresent) {
			// Return 401 Unauthorized status code with error message
			return res.status(401).json({
				success: false,
				message: `User is Already Registered`,
			});
		}

		var otp = otpGenerator.generate(6, {
			upperCaseAlphabets: false,
			lowerCaseAlphabets: false,
			specialChars: false,
		});
		const result = await OTP.findOne({ otp: otp });
		console.log("Result is Generate OTP Func");
		console.log("OTP", otp);
		console.log("Result", result);
		while (result) {
			otp = otpGenerator.generate(6, {
				upperCaseAlphabets: false,
			});
		}
		const otpPayload = { email, otp };
		const otpBody = await OTP.create(otpPayload);
		console.log("OTP Body", otpBody);

		res.status(200).json({
			success: true,
			message: `OTP Sent Successfully`,
			otp,
		});
	} catch (error) {
		console.log(error.message);
		return res.status(500).json({ success: false, error: error.message });
	}
};
