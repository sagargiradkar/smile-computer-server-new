const express = require("express");
const {
  registerCompany,
  createJobPost,
  notifyEligibleStudents,
  getPlacementStatistics,
  getStudentStatistics,
} = require("../controllers/tpoAdminController");

const authMiddleware = require("../middlewares/authMiddleware"); // Authentication middleware
const roleMiddleware = require("../middlewares/roleMiddleware"); // Role-based access control middleware

const router = express.Router();


/**
 * @swagger
 * /api/tpo/company:
 *   post:
 *     summary: Register a new company
 *     tags:
 *       - TPO Admin
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
 *                 example: "Tech Innovators"
 *               email:
 *                 type: string
 *                 example: "contact@techinnovators.com"
 *               website:
 *                 type: string
 *                 example: "https://techinnovators.com"
 *               description:
 *                 type: string
 *                 example: "Leading software development company."
 *     responses:
 *       201:
 *         description: Company registered successfully
 *       400:
 *         description: Invalid input
 */
router.post("/company", authMiddleware, roleMiddleware("admin"), registerCompany);

/**
 * @swagger
 * /api/tpo/job-post:
 *   post:
 *     summary: Create a new job post
 *     tags:
 *       - TPO Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyId:
 *                 type: string
 *                 example: "643e4c89c10bfc09511e4cb8"
 *               title:
 *                 type: string
 *                 example: "Software Engineer"
 *               description:
 *                 type: string
 *                 example: "Responsible for developing and maintaining enterprise applications."
 *               salaryPackage:
 *                 type: number
 *                 example: 12.5
 *               eligibilityCriteria:
 *                 type: string
 *                 example: "B.Tech in CS/IT or equivalent"
 *     responses:
 *       201:
 *         description: Job post created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/job-post", authMiddleware, roleMiddleware("admin"), createJobPost);

/**
 * @swagger
 * /api/tpo/notify/{jobId}:
 *   post:
 *     summary: Notify eligible students for a job
 *     tags:
 *       - TPO Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the job post
 *     responses:
 *       200:
 *         description: Eligible students notified successfully
 *       404:
 *         description: Job not found
 *       400:
 *         description: No eligible students found
 */
router.post("/notify/:jobId", authMiddleware, roleMiddleware("admin"), notifyEligibleStudents);

/**
 * @swagger
 * /api/tpo/statistics:
 *   get:
 *     summary: Fetch yearly placement statistics
 *     tags:
 *       - TPO Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched placement statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 year:
 *                   type: number
 *                   example: 2023
 *                 totalPlacements:
 *                   type: number
 *                   example: 150
 *                 averagePackage:
 *                   type: number
 *                   example: 10.5
 *                 highestPackage:
 *                   type: number
 *                   example: 35.5
 *       401:
 *         description: Unauthorized access
 */
router.get("/statistics", authMiddleware, roleMiddleware("admin"), getPlacementStatistics);

/**
 * @swagger
 * /api/tpo/students/statistics:
 *   get:
 *     summary: Get detailed placement records of all students
 *     tags:
 *       - TPO Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched detailed student placement records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   studentId:
 *                     type: string
 *                     example: "643e4c89c10bfc09511e4cb9"
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   company:
 *                     type: string
 *                     example: "Tech Innovators"
 *                   package:
 *                     type: number
 *                     example: 12.0
 *                   placementDate:
 *                     type: string
 *                     format: date
 *                     example: "2023-10-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized access
 */
router.get("/students/statistics", authMiddleware, roleMiddleware("admin"), getStudentStatistics);

module.exports = router;
