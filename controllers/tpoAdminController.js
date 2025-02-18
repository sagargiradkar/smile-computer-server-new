const Company = require("../models/Company"); // Import Company model
const JobPost = require("../models/JobPost"); // Import JobPost model
const Student = require("../models/Student"); // Import Student model
const asyncHandler = require("express-async-handler"); // Middleware for async error handling
const sendEmail = require("../config/email"); // Email utility for sending notifications

/**
 * @desc Register a new company
 * @route POST /api/tpo/company
 * @access Admin (TPO only)
 */
const registerCompany = asyncHandler(async (req, res) => {
  const { name, sector, location } = req.body;

  if (!name || !sector || !location) {
    res.status(400);
    throw new Error("Please provide all required fields: name, sector, and location.");
  }

  const existingCompany = await Company.findOne({ name });
  if (existingCompany) {
    res.status(400);
    throw new Error("Company already registered.");
  }

  const company = await Company.create({ name, sector, location });

  res.status(201).json({
    message: "Company registered successfully.",
    company,
  });
});

/**
 * @desc Create a new job post
 * @route POST /api/tpo/job-post
 * @access Admin (TPO only)
 */
const createJobPost = asyncHandler(async (req, res) => {
  const { companyId, title, description, salaryPackage, eligibilityCriteria } = req.body;

  if (!companyId || !title || !description || !salaryPackage || !eligibilityCriteria) {
    res.status(400);
    throw new Error("Please provide all required fields: companyId, title, description, salaryPackage, eligibilityCriteria.");
  }

  const company = await Company.findById(companyId);
  if (!company) {
    res.status(404);
    throw new Error("Company not found.");
  }

  const jobPost = await JobPost.create({
    company: companyId,
    title,
    description,
    salaryPackage,
    eligibility: eligibilityCriteria,
    createdBy: req.user.id,
  });

  res.status(201).json({
    message: "Job post created successfully.",
    jobPost,
  });
});

/**
 * @desc Send notification to all eligible students
 * @route POST /api/tpo/notify/:jobId
 * @access Admin (TPO only)
 */
const notifyEligibleStudents = asyncHandler(async (req, res) => {
  const jobId = req.params.jobId;

  const job = await JobPost.findById(jobId).populate("company");
  if (!job) {
    res.status(404);
    throw new Error("Job post not found.");
  }

  let filter = {}; // Add eligibility filters dynamically based on the job's criteria
  const eligibleStudents = await Student.find(filter);

  const emailList = eligibleStudents.map(student => student.email);
  const subject = `New Job Opportunity: ${job.title}`;
  const emailBody = `
    <h2>Dear Student,</h2>
    <p>A new job opportunity has been posted:</p>
    <ul>
      <li><strong>Company:</strong> ${job.company.name}</li>
      <li><strong>Role:</strong> ${job.title}</li>
      <li><strong>Package:</strong> ${job.salaryPackage} LPA</li>
    </ul>
    <p>Please check the portal and apply if you are eligible.</p>
  `;

  for (const email of emailList) {
    await sendEmail(email, subject, emailBody);
  }

  res.status(200).json({
    message: "Notification sent successfully.",
    notifiedStudents: emailList,
  });
});

/**
 * @desc Fetch yearly placement statistics
 * @route GET /api/tpo/statistics
 * @access Admin (TPO only)
 */
const getPlacementStatistics = asyncHandler(async (req, res) => {
  const statistics = {};

  statistics.totalCompaniesVisited = await Company.countDocuments({});
  statistics.totalJobPosts = await JobPost.countDocuments({});
  statistics.totalStudentsPlaced = await Student.countDocuments({ placed_status: true });

  const yearWiseStats = await Student.aggregate([
    {
      $group: {
        _id: { $year: "$updatedAt" }, 
        studentsPlaced: { $sum: 1 },
      },
    },
  ]);

  statistics.yearWisePlacements = yearWiseStats;

  res.status(200).json(statistics);
});

/**
 * @desc Get a summary of student placement records
 * @route GET /api/tpo/students/statistics
 * @access Admin (TPO only)
 */
const getStudentStatistics = asyncHandler(async (req, res) => {
  const students = await Student.find({}, "name email enrollment_no placed_status placement_info");

  res.status(200).json({
    message: "Student placement records fetched successfully.",
    students,
  });
});

module.exports = {
  registerCompany,
  createJobPost,
  notifyEligibleStudents,
  getPlacementStatistics,
  getStudentStatistics,
};
