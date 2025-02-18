const Student = require("../models/Student");
const JobPost = require("../models/JobPost");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  sendOTPEmail,
  generateOTP,
  getOTPExpiry,
  sendRegistrationSuccessEmail,
  sendLoginSuccessEmail,
  sendPasswordResetSuccessEmail
} = require("../utils/emailService");

// Utility Services
const authService = {
  generateToken: (userId) => {
    return jwt.sign(
      { id: userId, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1h' }
    );
  },

  validateRequiredFields: (data, fields) => {
    for (let field of fields) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }
  },

  hashPassword: async (password) => {
    return await bcrypt.hash(password, 10);
  }
};

const studentService = {
  async validateStudent(email, enrollment_no = null) {
    const query = { email };
    if (enrollment_no) {
      query.$or = [{ email }, { enrollment_no }];
    }
    
    const existingStudent = await Student.findOne(query);
    if (existingStudent) {
      if (existingStudent.email === email) {
        throw new Error("Email already registered");
      }
      if (enrollment_no && existingStudent.enrollment_no === enrollment_no) {
        throw new Error("Enrollment number already registered");
      }
    }
    return existingStudent;
  },

  async handleOTPVerification(student, otp) {
    if (student.accountLocked && student.lockUntil > new Date()) {
      throw new Error(`Account locked. Try again after ${student.lockUntil.toLocaleString()}`);
    }

    if (!student.isOtpValid(otp)) {
      await student.incrementOtpAttempts();
      if (student.accountLocked) {
        throw new Error(`Too many failed attempts. Account locked until ${student.lockUntil.toLocaleString()}`);
      }
      throw new Error(`Invalid or expired OTP. ${3 - student.otpAttempts} attempts remaining`);
    }

    await student.clearOtpFields();
    await student.resetOtpAttempts();
  }
};

// Controller Functions
const registerStudent = asyncHandler(async (req, res) => {
  const requiredFields = ['name', 'email', 'password', 'enrollment_no', 'branch', 'cgpa', 'resume_link'];
  authService.validateRequiredFields(req.body, requiredFields);

  await studentService.validateStudent(req.body.email, req.body.enrollment_no);

  const otp = generateOTP();
  const hashedPassword = await authService.hashPassword(req.body.password);

  const student = await Student.create({
    ...req.body,
    password: hashedPassword,
    otp,
    otpExpiry: getOTPExpiry(),
    otpType: 'registration',
    isEmailVerified: false
  });

  await sendOTPEmail(student.email, otp, 'registration');

  res.status(201).json({
    message: "Please verify your email with the OTP sent",
    email: student.email
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const student = await Student.findOne({ email, isEmailVerified: false });
  
  if (!student) {
    throw new Error("Registration request not found or already verified");
  }

  await studentService.handleOTPVerification(student, otp);
  
  student.isEmailVerified = true;
  await student.save();

  const token = authService.generateToken(student.id);

  try {
    await sendRegistrationSuccessEmail(student.email, student.name);
  } catch (error) {
    console.error('Error sending success email:', error);
  }

  res.status(200).json({
    message: "Registration completed successfully",
    token,
    student: {
      id: student.id,
      name: student.name,
      email: student.email
    }
  });
});

const initiateLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  authService.validateRequiredFields({ email, password }, ['email', 'password']);

  const student = await Student.findOne({ email });
  if (!student || !(await bcrypt.compare(password, student.password))) {
    throw new Error("Invalid credentials");
  }

  if (!student.isEmailVerified) {
    throw new Error("Please verify your email first");
  }

  if (student.accountLocked && student.lockUntil > new Date()) {
    throw new Error(`Account locked. Try again after ${student.lockUntil.toLocaleString()}`);
  }

  const otp = generateOTP();
  Object.assign(student, {
    otp,
    otpExpiry: getOTPExpiry(),
    otpType: 'login'
  });
  await student.save();

  await sendOTPEmail(email, otp, 'login');

  res.status(200).json({
    message: "Please enter the OTP sent to your email",
    email: student.email
  });
});

const verifyLogin = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const student = await Student.findOne({ email });

  if (!student) {
    throw new Error("Student not found");
  }

  await studentService.handleOTPVerification(student, otp);

  const token = authService.generateToken(student.id);

  try {
    await sendLoginSuccessEmail(student.email, student.name);
  } catch (error) {
    console.error('Error sending login success email:', error);
  }

  res.status(200).json({
    message: "Login successful",
    token,
    student: {
      id: student.id,
      name: student.name,
      email: student.email
    }
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const student = await Student.findOne({ email });

  if (!student) {
    throw new Error("Student not found");
  }

  const otp = generateOTP();
  Object.assign(student, {
    otp,
    otpExpiry: getOTPExpiry(),
    otpType: 'reset'
  });
  await student.save();

  await sendOTPEmail(email, otp, 'reset');

  res.status(200).json({
    message: "Please enter the OTP sent to your email to reset password",
    email: student.email
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const student = await Student.findOne({ email });

  if (!student) {
    throw new Error("Student not found");
  }

  await studentService.handleOTPVerification(student, otp);

  student.password = await authService.hashPassword(newPassword);
  await student.save();

  try {
    await sendPasswordResetSuccessEmail(student.email, student.name);
  } catch (error) {
    console.error('Error sending password reset success email:', error);
  }

  res.status(200).json({
    message: "Password reset successful",
    email: student.email
  });
});

const getStudentProfile = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.user.id)
    .select('-password -otp -otpExpiry -otpAttempts -otpType');

  if (!student) {
    throw new Error("Student not found");
  }

  res.status(200).json(student);
});

const updateStudentProfile = asyncHandler(async (req, res) => {
  const { name, phone, branch, cgpa, resume_link } = req.body;
  const student = await Student.findById(req.user.id);

  if (!student) {
    throw new Error("Student not found");
  }

  const updateFields = {
    ...(name && { name }),
    ...(phone && { phone }),
    ...(branch && { branch }),
    ...(cgpa && { cgpa }),
    ...(resume_link && { resume_link })
  };

  const updatedStudent = await Student.findByIdAndUpdate(
    req.user.id,
    updateFields,
    { new: true, select: '-password -otp -otpExpiry -otpAttempts -otpType' }
  );

  res.status(200).json({
    message: "Profile updated successfully",
    student: updatedStudent
  });
});

const applyJob = asyncHandler(async (req, res) => {
  const [job, student] = await Promise.all([
    JobPost.findById(req.params.jobId),
    Student.findById(req.user.id)
  ]);

  if (!job) {
    throw new Error("Job not found");
  }

  if (job.deadline && new Date(job.deadline) < new Date()) {
    throw new Error("Application deadline has passed");
  }

  if (job.minimumCGPA && student.cgpa < job.minimumCGPA) {
    throw new Error(`Minimum CGPA requirement (${job.minimumCGPA}) not met`);
  }

  if (student.appliedJobs.includes(req.params.jobId)) {
    throw new Error("Already applied for this job");
  }

  await Promise.all([
    Student.findByIdAndUpdate(student.id, { $push: { appliedJobs: job.id } }),
    JobPost.findByIdAndUpdate(job.id, { $push: { applicants: student.id } })
  ]);

  res.status(200).json({
    message: "Successfully applied for the job",
    jobTitle: job.title,
    company: job.company,
    applicationDate: new Date()
  });
});

const getAppliedJobs = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.user.id)
    .populate({
      path: 'appliedJobs',
      select: 'title company location salary description status deadline',
      match: { status: { $ne: 'closed' } }
    });

  if (!student) {
    throw new Error("Student not found");
  }

  const appliedJobs = student.appliedJobs.map(job => ({
    id: job._id,
    title: job.title,
    company: job.company,
    location: job.location,
    salary: job.salary,
    description: job.description,
    status: job.status,
    deadline: job.deadline,
    appliedDate: job.applicants.find(
      applicant => applicant.student.toString() === req.user.id
    )?.appliedDate
  }));

  res.status(200).json(appliedJobs);
});

module.exports = {
  registerStudent,
  verifyEmail,
  initiateLogin,
  verifyLogin,
  forgotPassword,
  resetPassword,
  getStudentProfile,
  updateStudentProfile,
  applyJob,
  getAppliedJobs
};
