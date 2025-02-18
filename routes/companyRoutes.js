const express = require("express");
const {
  registerCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getCompanyDrives,
  getCompanyJobPosts,
} = require("../controllers/companyController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/company/register:
 *   post:
 *     summary: Register a new company
 *     tags: 
 *       - Company
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
 *                 example: "Tech Solutions"
 *               description:
 *                 type: string
 *                 example: "Software development company specializing in web applications."
 *               website:
 *                 type: string
 *                 example: "https://techsolutions.com"
 *               email:
 *                 type: string
 *                 example: "contact@techsolutions.com"
 *     responses:
 *       201:
 *         description: Successfully registered company
 *       400:
 *         description: Invalid input
 */
router.post("/register", authMiddleware, roleMiddleware("admin"), registerCompany);

/**
 * @swagger
 * /api/company:
 *   get:
 *     summary: Get all registered companies
 *     tags:
 *       - Company
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved company list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "643f1234567890000000abcd"
 *                   name:
 *                     type: string
 *                     example: "Tech Solutions"
 *                   website:
 *                     type: string
 *                     example: "https://techsolutions.com"
 *                   email:
 *                     type: string
 *                     example: "contact@techsolutions.com"
 */
router.get("/", authMiddleware, roleMiddleware("admin"), getAllCompanies);

/**
 * @swagger
 * /api/company/{id}:
 *   get:
 *     summary: Get details of a specific company by ID
 *     tags:
 *       - Company
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The company ID
 *     responses:
 *       200:
 *         description: Successfully retrieved company details
 *       404:
 *         description: Company not found
 */
router.get("/:id", authMiddleware, roleMiddleware("admin"), getCompanyById);

/**
 * @swagger
 * /api/company/{id}:
 *   put:
 *     summary: Update details of a specific company
 *     tags:
 *       - Company
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The company ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Tech Innovators"
 *               description:
 *                 type: string
 *                 example: "Updated company description."
 *               website:
 *                 type: string
 *                 example: "https://techinnovators.com"
 *     responses:
 *       200:
 *         description: Successfully updated company details
 *       404:
 *         description: Company not found
 */
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateCompany);

/**
 * @swagger
 * /api/company/{id}:
 *   delete:
 *     summary: Delete a specific company
 *     tags:
 *       - Company
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The company ID
 *     responses:
 *       200:
 *         description: Successfully deleted company
 *       404:
 *         description: Company not found
 */
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteCompany);

/**
 * @swagger
 * /api/company/{id}/drives:
 *   get:
 *     summary: Get placement drives of a company
 *     tags:
 *       - Company
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The company ID
 *     responses:
 *       200:
 *         description: Successfully retrieved placement drives
 *       404:
 *         description: Company or placement drives not found
 */
router.get("/:id/drives", authMiddleware, roleMiddleware("admin"), getCompanyDrives);

/**
 * @swagger
 * /api/company/{id}/job-posts:
 *   get:
 *     summary: Get all job posts created by a company
 *     tags:
 *       - Company
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The company ID
 *     responses:
 *       200:
 *         description: Successfully retrieved job posts
 *       404:
 *         description: Company or job posts not found
 */
router.get("/:id/job-posts", authMiddleware, roleMiddleware("admin"), getCompanyJobPosts);

module.exports = router;
