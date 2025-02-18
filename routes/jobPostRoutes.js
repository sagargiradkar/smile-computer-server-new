const express = require("express");
const {
  createJobPost,
  getJobPosts,
  getJobPostById,
  updateJobPost,
  deleteJobPost,
  notifyEligibleStudents,
} = require("../controllers/jobPostController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/job-post:
 *   post:
 *     summary: Create a new job post
 *     tags: 
 *       - Job Posts
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
 *                 example: "63f1cce08940210e26a53571"
 *               title:
 *                 type: string
 *                 example: "Software Engineer"
 *               description:
 *                 type: string
 *                 example: "A software engineering job opportunity."
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
router.post("/", authMiddleware, roleMiddleware("admin"), createJobPost);

/**
 * @swagger
 * /api/job-posts:
 *   get:
 *     summary: Get all job posts
 *     tags:
 *       - Job Posts
 *     responses:
 *       200:
 *         description: Successfully retrieved all job posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "643e4c89c10bfc09511e4cb8"
 *                   company:
 *                     type: string
 *                     example: "Tech Innovators"
 *                   title:
 *                     type: string
 *                     example: "Software Developer"
 *                   description:
 *                     type: string
 *                     example: "We are hiring for a software engineer role."
 *                   salaryPackage:
 *                     type: number
 *                     example: 10.0
 */
router.get("/", getJobPosts);

/**
 * @swagger
 * /api/job-post/{id}:
 *   get:
 *     summary: Get a specific job post by ID
 *     tags:
 *       - Job Posts
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the job post to fetch
 *     responses:
 *       200:
 *         description: Successfully retrieved job post
 *       404:
 *         description: Job post not found
 */
router.get("/:id", getJobPostById);

/**
 * @swagger
 * /api/job-post/{id}:
 *   put:
 *     summary: Update a specific job post by ID
 *     tags:
 *       - Job Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           required: true
 *           description: ID of the job post to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Senior Software Engineer"
 *               description:
 *                 type: string
 *                 example: "An updated description for the job."
 *               salaryPackage:
 *                 type: number
 *                 example: 15.0
 *               eligibilityCriteria:
 *                 type: string
 *                 example: "Graduate with 2+ years of experience in software development"
 *     responses:
 *       200:
 *         description: Successfully updated job post
 *       404:
 *         description: Job post not found
 */
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateJobPost);

/**
 * @swagger
 * /api/job-post/{id}:
 *   delete:
 *     summary: Delete a specific job post by ID
 *     tags:
 *       - Job Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           required: true
 *           description: ID of the job post to delete
 *     responses:
 *       200:
 *         description: Successfully deleted job post
 *       404:
 *         description: Job post not found
 */
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteJobPost);

/**
 * @swagger
 * /api/job-post/{id}/notify:
 *   post:
 *     summary: Notify eligible students for a job post
 *     tags:
 *       - Job Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           required: true
 *           description: ID of the job post to notify eligible students about
 *     responses:
 *       200:
 *         description: Successfully notified eligible students
 *       404:
 *         description: Job post not found
 *       400:
 *         description: No eligible students found
 */
router.post("/:id/notify", authMiddleware, roleMiddleware("admin"), notifyEligibleStudents);

module.exports = router;
