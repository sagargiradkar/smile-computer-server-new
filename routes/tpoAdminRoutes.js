const express = require("express");
const {
  registerAdmin,
  loginAdmin,
  registerCompany,
  createJobPost,
  notifyEligibleStudents,
  getPlacementStatistics,
  getStudentStatistics,
} = require("../controllers/tpoAdminController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/tpo/register:
 *   post:
 *     summary: Register a new admin
 *     tags:
 *       - TPO Admin
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
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       400:
 *         description: Invalid input
 */
router.post("/register", registerAdmin);

/**
 * @swagger
 * /api/tpo/login:
 *   post:
 *     summary: Login as an admin
 *     tags:
 *       - TPO Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */
router.post("/login", loginAdmin);

router.post("/company", authMiddleware, roleMiddleware("admin"), registerCompany);
router.post("/job-post", authMiddleware, roleMiddleware("admin"), createJobPost);
router.post("/notify/:jobId", authMiddleware, roleMiddleware("admin"), notifyEligibleStudents);
router.get("/statistics", authMiddleware, roleMiddleware("admin"), getPlacementStatistics);
router.get("/students/statistics", authMiddleware, roleMiddleware("admin"), getStudentStatistics);

module.exports = router;
