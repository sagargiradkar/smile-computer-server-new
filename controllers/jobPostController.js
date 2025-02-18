const JobPost = require("../models/JobPost"); // Import JobPost model
const Student = require("../models/Student"); // Import Student model
const Company = require("../models/Company"); // Import Company model
const asyncHandler = require("express-async-handler"); // Middleware for async error handling
const sendEmail = require("../config/email"); // Email utility for notifications

/**
 * @desc Create a new job post
 * @route POST /api/job-post
 * @access Admin (TPO only)
 */
const createJobPost = asyncHandler(async (req, res) => {
  const { companyId, title, description, salaryPackage, eligibilityCriteria } = req.body;

  // Validate input
  if (!companyId || !title || !description || !salaryPackage || !eligibilityCriteria) {
    res.status(400);
    throw new Error("Please provide all required fields (companyId, title, description, salaryPackage, eligibilityCriteria).");
  }

  // Check if the company exists
  const company = await Company.findById(companyId);
  if (!company) {
    res.status(404);
    throw new Error("Company not found.");
  }

  // Create a new job post linked to the company
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
 * @desc Get all job posts (optionally filter by company)
 * @route GET /api/job-posts
 * @access Public
 */
const getJobPosts = asyncHandler(async (req, res) => {
  const { companyId } = req.query; // Optional filtering by company
  let filter = {};
  if (companyId) filter.company = companyId;

  const jobPosts = await JobPost.find(filter).populate("company"); // Fetch all job posts
  res.status(200).json(jobPosts);
});

/**
 * @desc Get details of a single job post
 * @route GET /api/job-post/:id
 * @access Public
 */
const getJobPostById = asyncHandler(async (req, res) => {
  const jobPostId = req.params.id;

  // Find job post by ID
  const jobPost = await JobPost.findById(jobPostId).populate("company");
  if (!jobPost) {
    res.status(404);
    throw new Error("Job post not found.");
  }

  res.status(200).json(jobPost);
});

/**
 * @desc Update a job post
 * @route PUT /api/job-post/:id
 * @access Admin (TPO only)
 */
const updateJobPost = asyncHandler(async (req, res) => {
  const jobPostId = req.params.id;

  // Find the job post
  const jobPost = await JobPost.findById(jobPostId);
  if (!jobPost) {
    res.status(404);
    throw new Error("Job post not found.");
  }

  // Update the fields
  const { title, description, salaryPackage, eligibilityCriteria } = req.body;
  jobPost.title = title || jobPost.title;
  jobPost.description = description || jobPost.description;
  jobPost.salaryPackage = salaryPackage || jobPost.salaryPackage;
  jobPost.eligibility = eligibilityCriteria || jobPost.eligibility;

  const updatedJobPost = await jobPost.save(); // Save updated job post
  res.status(200).json({
    message: "Job post updated successfully.",
    updatedJobPost,
  });
});

/**
 * @desc Delete a job post
 * @route DELETE /api/job-post/:id
 * @access Admin (TPO only)
 */
const deleteJobPost = asyncHandler(async (req, res) => {
  const jobPostId = req.params.id;

  // Find the job post
  const jobPost = await JobPost.findById(jobPostId);
  if (!jobPost) {
    res.status(404);
    throw new Error("Job post not found.");
  }

  await jobPost.remove(); // Remove job post
  res.status(200).json({
    message: `Job post with ID ${jobPostId} deleted successfully.`,
  });
});

/**
 * @desc Notify eligible students for a specific job post
 * @route POST /api/job-post/:id/notify
 * @access Admin (TPO only)
 */
const notifyEligibleStudents = asyncHandler(async (req, res) => {
  const jobPostId = req.params.id;

  // Find the job post
  const jobPost = await JobPost.findById(jobPostId).populate("company");
  if (!jobPost) {
    res.status(404);
    throw new Error("Job post not found.");
  }

  // Filter eligible students based on job post criteria (implement eligibility logic as needed)
  const eligibleStudents = await Student.find({}).lean(); // Retrieve all students (implement proper filtering)
  const emailList = eligibleStudents.map((student) => student.email);

  if (!emailList.length) {
    res.status(400);
    throw new Error("No eligible students found to notify.");
  }

  // Send emails
  const subject = `New Job Opportunity: ${jobPost.title}`;
  const emailBody = `
    <h3>${jobPost.company.name} is hiring!</h3>
    <p>Position: ${jobPost.title}</p>
    <p>Package: ${jobPost.salaryPackage} LPA</p>
    <p>Check out the job and apply now!</p>
  `;

  for (const email of emailList) {
    await sendEmail(email, subject, emailBody);
  }

  res.status(200).json({
    message: "Notification sent to eligible students.",
    notifiedStudents: emailList,
  });
});

module.exports = {
  createJobPost,
  getJobPosts,
  getJobPostById,
  updateJobPost,
  deleteJobPost,
  notifyEligibleStudents,
};
