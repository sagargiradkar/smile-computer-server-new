const Student = require("../models/Student");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  sendOTPEmail,
  generateOTP,
  getOTPExpiry,
  sendRegistrationSuccessEmail,
  sendLoginSuccessEmail,
  sendPasswordResetSuccessEmail,
} = require("../utils/emailService");
const PendingRegistration = require("../models/PendingRegistration");
// Utility Services
const authService = {
  generateToken: (userId) => {
    return jwt.sign({ id: userId, role: "student" }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "1h",
    });
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
  },
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
      throw new Error(
        `Account locked. Try again after ${student.lockUntil.toLocaleString()}`
      );
    }

    if (!student.isOtpValid(otp)) {
      await student.incrementOtpAttempts();
      if (student.accountLocked) {
        throw new Error(
          `Too many failed attempts. Account locked until ${student.lockUntil.toLocaleString()}`
        );
      }
      throw new Error(
        `Invalid or expired OTP. ${3 - student.otpAttempts} attempts remaining`
      );
    }

    await student.clearOtpFields();
    await student.resetOtpAttempts();
  },
};

const registerStudent = asyncHandler(async (req, res) => {
  const requiredFields = ["name", "email", "password", "mobile"];
  authService.validateRequiredFields(req.body, requiredFields);

  await studentService.validateStudent(req.body.email);

  const otp = generateOTP();
  const hashedPassword = await authService.hashPassword(req.body.password);

  try {
    // Send OTP email first
    await sendOTPEmail(req.body.email, otp, "registration");

    // Store in PendingRegistration **only if email sending is successful**
    await PendingRegistration.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      mobile: req.body.mobile,
      otp,
      otpExpiry: getOTPExpiry(),
    });

    res.status(201).json({
      message: "OTP sent to email. Verify OTP to complete registration.",
      email: req.body.email,
    });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
});


const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const pendingUser = await PendingRegistration.findOne({ email });

  if (!pendingUser) {
    return res
      .status(400)
      .json({ message: "Registration request not found or already verified." });
  }

  // Check if OTP is expired
  if (new Date() > new Date(pendingUser.otpExpiry)) {
    return res
      .status(400)
      .json({ message: "OTP has expired. Please request a new one." });
  }

  // Verify OTP
  if (pendingUser.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP. Please try again." });
  }

  // Move user to Student collection
  const student = await Student.create({
    name: pendingUser.name,
    email: pendingUser.email,
    password: pendingUser.password,
    mobile: pendingUser.mobile,
    isEmailVerified: true,
  });

  // Delete from PendingRegistration
  await PendingRegistration.deleteOne({ email });

  // Generate JWT token
  const token = authService.generateToken(student.id);

  // Send success email
  try {
    await sendRegistrationSuccessEmail(student.email, student.name);
  } catch (error) {
    console.error("Error sending success email:", error);
  }

  res.status(200).json({
    message: "Registration completed successfully!",
    token,
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
    },
  });
});

const initiateLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  authService.validateRequiredFields({ email, password }, [
    "email",
    "password",
  ]);

  const student = await Student.findOne({ email });
  if (!student || !(await bcrypt.compare(password, student.password))) {
    throw new Error("Invalid credentials");
  }

  if (!student.isEmailVerified) {
    throw new Error("Please verify your email first");
  }

  if (student.accountLocked && student.lockUntil > new Date()) {
    throw new Error(
      `Account locked. Try again after ${student.lockUntil.toLocaleString()}`
    );
  }

  const otp = generateOTP();
  Object.assign(student, {
    otp,
    otpExpiry: getOTPExpiry(),
    otpType: "login",
  });
  await student.save();

  await sendOTPEmail(email, otp, "login");

  res.status(200).json({
    message: "Please enter the OTP sent to your email",
    email: student.email,
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
    console.error("Error sending login success email:", error);
  }

  res.status(200).json({
    message: "Login successful",
    token,
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
    },
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
    otpType: "reset",
  });
  await student.save();

  await sendOTPEmail(email, otp, "reset");

  res.status(200).json({
    message: "Please enter the OTP sent to your email to reset password",
    email: student.email,
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
    console.error("Error sending password reset success email:", error);
  }

  res.status(200).json({
    message: "Password reset successful",
    email: student.email,
  });
});

const getStudentProfile = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.user.id).select(
    "-password -otp -otpExpiry -otpAttempts -otpType"
  );

  if (!student) {
    throw new Error("Student not found");
  }

  res.status(200).json(student);
});

const updateStudentProfile = asyncHandler(async (req, res) => {
  const { name, mobile } = req.body;
  const student = await Student.findById(req.user.id);

  if (!student) {
    throw new Error("Student not found");
  }

  const updateFields = {
    ...(name && { name }),
    ...(mobile && { mobile }),
  };

  const updatedStudent = await Student.findByIdAndUpdate(
    req.user.id,
    updateFields,
    { new: true, select: "-password -otp -otpExpiry -otpAttempts -otpType" }
  );

  res.status(200).json({
    message: "Profile updated successfully",
    student: updatedStudent,
  });
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
};
