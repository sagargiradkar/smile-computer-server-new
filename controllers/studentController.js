const Student = require("../models/Student"); // Student model
const JobPost = require("../models/JobPost"); // JobPost model
const asyncHandler = require("express-async-handler"); // Middleware for async error handling
const bcrypt = require("bcryptjs"); // For password hashing
const jwt = require("jsonwebtoken"); // For generating authentication tokens

/**
 * @desc Register a new student
 * @route POST /api/student/register
 * @access Public
 */
const registerStudent = asyncHandler(async (req, res) => {
  const { name, email, password, enrollment_no, branch, cgpa, resume_link } = req.body;

  // Validate required fields
  if (!name || !email || !password || !enrollment_no || !branch || !cgpa || !resume_link) {
    res.status(400);
    throw new Error("Please provide all required fields (name, email, password, enrollment_no, branch, cgpa, resume_link).");
  }

  // Check if the student already exists
  const existingStudent = await Student.findOne({ email });
  if (existingStudent) {
    res.status(400);
    throw new Error("Student already registered.");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the student
  const student = await Student.create({
    name,
    email,
    password: hashedPassword,
    enrollment_no,
    branch,
    cgpa,
    resume_link
  });

  // Send success response
  res.status(201).json({
    message: "Student registered successfully.",
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
      enrollment_no: student.enrollment_no,
    },
  });
});


/**
 * @desc Authenticate a student
 * @route POST /api/student/login
 * @access Public
 */
const loginStudent = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide both email and password.");
  }

  const student = await Student.findOne({ email });
  if (!student) {
    res.status(401);
    throw new Error("Invalid credentials.");
  }

  const isMatch = await bcrypt.compare(password, student.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials.");
  }

  const token = jwt.sign({ id: student.id, role: "student" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1h', // Default to "1h" if JWT_EXPIRE is not set
  });

  res.status(200).json({
    message: "Login successful.",
    token,
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
    },
  });
});


/**
 * @desc Get the logged-in student's profile
 * @route GET /api/student/profile
 * @access Private
 */
const getStudentProfile = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.user.id);
  if (!student) {
    res.status(404);
    throw new Error("Student not found.");
  }
  res.status(200).json(student);
});

/**
 * @desc Update the logged-in student's profile
 * @route PUT /api/student/profile
 * @access Private
 */
const updateStudentProfile = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.user.id);
  if (!student) {
    res.status(404);
    throw new Error("Student not found.");
  }

  const { name, email } = req.body;
  student.name = name || student.name;
  student.email = email || student.email;

  const updatedStudent = await student.save();
  res.status(200).json(updatedStudent);
});

/**
 * @desc Apply for a job
 * @route POST /api/student/apply/:jobId
 * @access Private
 */
const applyJob = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.user.id);
  const job = await JobPost.findById(req.params.jobId);

  if (!job) {
    res.status(404);
    throw new Error("Job not found.");
  }

  // Example eligibility logic (you can customize this)
  if (student.placed_status) {
    const lastPlacement = student.placement_info[student.placement_info.length - 1];
    if (job.salaryPackage - lastPlacement.salary < 2.5) {
      res.status(400);
      throw new Error("You are not eligible for this job.");
    }
  }

  if (!student.applied_jobs.includes(req.params.jobId)) {
    student.applied_jobs.push(req.params.jobId);
    await student.save();
  }

  res.status(200).json({
    message: "Successfully applied for the job.",
    job,
  });
});

/**
 * @desc Get all jobs applied by the student
 * @route GET /api/student/applied-jobs
 * @access Private
 */
const getAppliedJobs = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.user.id).populate("applied_jobs");
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }
  res.status(200).json(student.applied_jobs);
});

module.exports = {
  registerStudent,
  loginStudent,
  getStudentProfile,
  updateStudentProfile,
  applyJob,
  getAppliedJobs,
};
