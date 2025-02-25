// Import the required modules
const express = require("express")
const router = express.Router()

// Import the required controllers and middleware functions
const {
  login,
  signup,
  sendotp,
} = require("../controllers/Auth")

const {isDemo}=require("../middlewares/demo");
const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword")

const { auth } = require("../middlewares/auth")

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// Route for user login
/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns a JWT token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 user:
 *                   type: object
 *                   description: User details
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Incorrect password or unregistered user
 *       500:
 *         description: Internal server error
 */
router.post("/login", login)

// Route for user signup
/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with the provided details.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - confirmPassword
 *               - otp
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: First name of the user
 *               lastName:
 *                 type: string
 *                 description: Last name of the user
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the user
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password for the account
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: Confirmation of the password
 *               accountType:
 *                 type: string
 *                 enum: [Student, Instructor, Admin]
 *                 description: Type of user account
 *               contactNumber:
 *                 type: string
 *                 description: Contact number of the user
 *               otp:
 *                 type: string
 *                 description: OTP received for verification
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Bad request, validation errors
 *       403:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post("/signup", signup)

// Route for sending OTP to the user's email
/**
 * @swagger
 * /api/v1/auth/sendotp:
 *   post:
 *     summary: Send OTP for email verification
 *     description: Generates and sends a 6-digit OTP for email verification.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address for OTP verification
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 otp:
 *                   type: string
 *                   description: The generated OTP (for development/testing)
 *       401:
 *         description: User is already registered
 *       500:
 *         description: Internal server error
 */
router.post("/sendotp", sendotp)

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Route for generating a reset password token
/**
 * @swagger
 * /api/v1/auth/reset-password-token:
 *   post:
 *     summary: Generate a password reset token
 *     description: Sends an email with a password reset link containing a unique token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The registered email address for password reset
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *       400:
 *         description: Invalid or unregistered email
 *       500:
 *         description: Internal server error
 */
router.post("/reset-password-token", resetPasswordToken)

// Route for resetting user's password after verification
/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Allows users to reset their password using a valid reset token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmPassword
 *               - token
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The new password
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: Must match the new password
 *               token:
 *                 type: string
 *                 description: The password reset token received via email
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid input or mismatched passwords
 *       403:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 */

router.post("/reset-password", resetPassword)

// Export the router for use in the main application
module.exports = router;