const Company = require("../models/Company"); // Company model
const JobPost = require("../models/JobPost"); // JobPost model
const asyncHandler = require("express-async-handler"); // Async error handling middleware

/**
 * @desc Register a new company
 * @route POST /api/company
 * @access Admin (TPO only)
 */
const registerCompany = asyncHandler(async (req, res) => {
  const { name, sector, location } = req.body;

  if (!name || !sector || !location) {
    res.status(400);
    throw new Error("Please provide all required fields (name, sector, location).");
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
 * @desc Get all companies
 * @route GET /api/company
 * @access Private
 */
const getAllCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find(); // Fetch all companies
  res.status(200).json(companies); // Send JSON response
});

/**
 * @desc Get a single company by ID
 * @route GET /api/company/:id
 * @access Private
 */
const getCompanyById = asyncHandler(async (req, res) => {
  const companyId = req.params.id;

  const company = await Company.findById(companyId).populate("job_posts"); // Populate job-related data
  if (!company) {
    res.status(404);
    throw new Error("Company not found.");
  }

  res.status(200).json(company);
});

/**
 * @desc Update a company's details
 * @route PUT /api/company/:id
 * @access Admin (TPO only)
 */
const updateCompany = asyncHandler(async (req, res) => {
  const companyId = req.params.id;

  const company = await Company.findById(companyId);
  if (!company) {
    res.status(404);
    throw new Error("Company not found.");
  }

  const { name, sector, location } = req.body;

  company.name = name || company.name;
  company.sector = sector || company.sector;
  company.location = location || company.location;

  const updatedCompany = await company.save(); // Save updated details
  res.status(200).json({
    message: "Company updated successfully.",
    updatedCompany,
  });
});

/**
 * @desc Delete a company
 * @route DELETE /api/company/:id
 * @access Admin (TPO only)
 */
const deleteCompany = asyncHandler(async (req, res) => {
  const companyId = req.params.id;

  const company = await Company.findById(companyId);
  if (!company) {
    res.status(404);
    throw new Error("Company not found.");
  }

  await company.remove(); // Delete the company
  res.status(200).json({
    message: `Company with ID ${companyId} deleted successfully.`,
  });
});

/**
 * @desc Get all placement drives for a specific company
 * @route GET /api/company/:id/drives
 * @access Private
 */
const getCompanyDrives = asyncHandler(async (req, res) => {
  const companyId = req.params.id;

  const company = await Company.findById(companyId).populate("drives"); // Assuming drives are linked in the model
  if (!company) {
    res.status(404);
    throw new Error("Company not found.");
  }

  res.status(200).json(company.drives); // Return all drives
});

/**
 * @desc Get all job posts created by a specific company
 * @route GET /api/company/:id/job-posts
 * @access Private
 */
const getCompanyJobPosts = asyncHandler(async (req, res) => {
  const companyId = req.params.id;

  const jobPosts = await JobPost.find({ company: companyId }); // Fetch job posts by companyId
  res.status(200).json(jobPosts); // Send response
});

module.exports = {
  registerCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getCompanyDrives,
  getCompanyJobPosts,
};
