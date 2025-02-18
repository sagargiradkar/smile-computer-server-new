const express = require("express");
const {
  registerStudent,
  loginStudent,
  getStudentProfile,
  updateStudentProfile,
  applyJob,
  getAppliedJobs,
} = require("../controllers/studentController"); // Importing controller functions

const authMiddleware = require("../middlewares/authMiddleware"); // Authentication middleware
const roleMiddleware = require("../middlewares/roleMiddleware"); // Role validation middleware

const router = express.Router();

/**
 * @swagger
 * /api/student/register:
 *   post:
 *     summary: Register a new student
 *     tags:
 *       - Student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "password12345"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               course:
 *                 type: string
 *                 example: "B.Tech"
 *               year:
 *                 type: number
 *                 example: 2023
 *     responses:
 *       201:
 *         description: Student registered successfully
 *       400:
 *         description: Invalid input
 */
router.post("/register", registerStudent);

/**
 * @swagger
 * /api/student/login:
 *   post:
 *     summary: Student login
 *     tags:
 *       - Student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "password12345"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginStudent);

/**
 * @swagger
 * /api/student/profile:
 *   get:
 *     summary: Get the profile of the logged-in student
 *     tags:
 *       - Student
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the student's profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "643e4c89c10bfc09511e4cb9"
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *                 phone:
 *                   type: string
 *                   example: "9876543210"
 *                 course:
 *                   type: string
 *                   example: "B.Tech"
 *                 year:
 *                   type: number
 *                   example: 2023
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", authMiddleware, roleMiddleware("student"), getStudentProfile);

/**
 * @swagger
 * /api/student/profile:
 *   put:
 *     summary: Update the profile of the logged-in student
 *     tags:
 *       - Student
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               course:
 *                 type: string
 *                 example: "B.Tech"
 *               year:
 *                 type: number
 *                 example: 2023
 *     responses:
 *       200:
 *         description: Successfully updated the student's profile
 *       401:
 *         description: Unauthorized
 */
router.put("/profile", authMiddleware, roleMiddleware("student"), updateStudentProfile);

/**
 * @swagger
 * /api/student/apply/{jobId}:
 *   post:
 *     summary: Apply for a job (only for the logged-in student)
 *     tags:
 *       - Student
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the job to apply for
 *     responses:
 *       200:
 *         description: Job application successful
 *       404:
 *         description: Job not found
 *       400:
 *         description: Already applied
 */
router.post("/apply/:jobId", authMiddleware, roleMiddleware("student"), applyJob);

/**
 * @swagger
 * /api/student/applied-jobs:
 *   get:
 *     summary: Get all jobs applied for by the student
 *     tags:
 *       - Student
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched all applied jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   jobId:
 *                     type: string
 *                     example: "643e4c89c10bfc09511e4cb8"
 *                   title:
 *                     type: string
 *                     example: "Software Developer"
 *                   company:
 *                     type: string
 *                     example: "Tech Innovators"
 *                   appliedDate:
 *                     type: string
 *                     example: "2023-10-01T00:00:00.000Z"
 */
router.get("/applied-jobs", authMiddleware, roleMiddleware("student"), getAppliedJobs);

module.exports = router;
