const express = require("express");
const {
  registerStudent,
  verifyEmail,
  initiateLogin,
  forgotPassword,
  resetPassword,
  getStudentProfile,
  updateStudentProfile,
  deleteStudentProfile
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

/**
 * @swagger
 * /api/student/profile:
 *   get:
 *     summary: Get student profile
 *     description: Retrieves the authenticated student's profile details.
 *     tags:
 *       - Student
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved student profile.
 *       401:
 *         description: Unauthorized - Token is missing or invalid.
 *       403:
 *         description: Forbidden - User does not have the required role.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/profile", authMiddleware, roleMiddleware("student"), getStudentProfile);

/**
 * @swagger
 * /api/student/profile:
 *   put:
 *     summary: Update student profile
 *     description: Allows a student to update their profile details.
 *     tags:
 *       - Student
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               mobile:
 *                 type: string
 *               address:
 *                 type: string
 *               profilePhoto:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated student profile.
 *       400:
 *         description: Bad Request - Invalid input data.
 *       401:
 *         description: Unauthorized - Token is missing or invalid.
 *       403:
 *         description: Forbidden - User does not have the required role.
 *       500:
 *         description: Internal Server Error.
 */
router.put("/profile", authMiddleware, roleMiddleware("student"), updateStudentProfile);

/**
 * @swagger
 * /api/student/profile:
 *   delete:
 *     summary: Delete student profile
 *     description: Allows a student to delete their own account permanently.
 *     tags: 
 *       - Student
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully deleted student profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Student account deleted successfully."
 *       401:
 *         description: Unauthorized - Token is missing or invalid.
 *       403:
 *         description: Forbidden - User does not have the required role.
 *       404:
 *         description: Student profile not found.
 *       500:
 *         description: Internal Server Error.
 */

router.delete("/profile", authMiddleware, roleMiddleware("student"), deleteStudentProfile);

module.exports = router;