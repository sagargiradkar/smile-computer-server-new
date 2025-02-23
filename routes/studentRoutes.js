const express = require("express");
const {
  registerStudent,
  verifyEmail,
  initiateLogin,
  verifyLogin,
  forgotPassword,
  resetPassword,
  getStudentProfile,
  updateStudentProfile,
} = require("../controllers/studentController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/student/register:
 *   post:
 *     summary: Register a new student and send verification OTP
 *     tags:
 *       - Student Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - mobile
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               mobile:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration initiated, verification OTP sent
 *       400:
 *         description: Invalid input or email already registered
 */
router.post("/register", registerStudent);

/**
 * @swagger
 * /api/student/verify-email:
 *   post:
 *     summary: Verify email using OTP
 *     tags:
 *       - Student Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/verify-email", verifyEmail);

/**
 * @swagger
 * /api/student/login:
 *   post:
 *     summary: Initiate student login (Step 1 - Send OTP)
 *     tags:
 *       - Student Authentication
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login OTP sent successfully
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", initiateLogin);

/**
 * @swagger
 * /api/student/verify-login:
 *   post:
 *     summary: Complete login with OTP (Step 2)
 *     tags:
 *       - Student Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/verify-login", verifyLogin);

/**
 * @swagger
 * /api/student/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     tags:
 *       - Student Authentication
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
 *     responses:
 *       200:
 *         description: Password reset OTP sent
 *       404:
 *         description: Student not found
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/student/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags:
 *       - Student Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/reset-password", resetPassword);

// Existing protected routes
router.get("/profile", authMiddleware, roleMiddleware("student"), getStudentProfile);
router.put("/profile", authMiddleware, roleMiddleware("student"), updateStudentProfile);

module.exports = router;