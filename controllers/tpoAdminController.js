const Company = require("../models/Company");
const JobPost = require("../models/JobPost");
const Student = require("../models/Student");
const Admin = require("../models/TpoAdmin");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { 
  sendJobNotificationEmail,
  sendCompanyRegistrationEmail
} = require("../utils/emailService");

// Auth Service
const authService = {
  generateToken: (adminId) => {
    return jwt.sign(
      { id: adminId, role: "admin" },
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

// Admin Service
const adminService = {
  async validateAdmin(email) {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw new Error("Admin not found");
    }
    return admin;
  },

  async checkCompanyExists(email) {
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      throw new Error("Company with this email already exists");
    }
  }
};

// Admin Authentication Controllers
const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, employeeId } = req.body;
  authService.validateRequiredFields({ name, email, password, employeeId }, 
    ['name', 'email', 'password', 'employeeId']);

  const existingAdmin = await Admin.findOne({ 
    $or: [{ email }, { employeeId }] 
  });
  
  if (existingAdmin) {
    throw new Error("Admin already exists with this email or employee ID");
  }

  const hashedPassword = await authService.hashPassword(password);

  const admin = await Admin.create({
    name,
    email,
    password: hashedPassword,
    employeeId,
    role: 'admin'
  });

  const token = authService.generateToken(admin.id);

  res.status(201).json({
    message: "Admin registered successfully",
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      employeeId: admin.employeeId
    }
  });
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  authService.validateRequiredFields({ email, password }, ['email', 'password']);

  const admin = await adminService.validateAdmin(email);

  if (!(await bcrypt.compare(password, admin.password))) {
    throw new Error("Invalid credentials");
  }

  const token = authService.generateToken(admin.id);

  res.status(200).json({
    message: "Login successful",
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      employeeId: admin.employeeId
    }
  });
});

// Company Management
const registerCompany = asyncHandler(async (req, res) => {
  const { name, email, website, description } = req.body;
  authService.validateRequiredFields(
    { name, email, website, description },
    ['name', 'email', 'website', 'description']
  );

  await adminService.checkCompanyExists(email);

  const company = await Company.create({
    name,
    email,
    website,
    description,
    registeredBy: req.user.id
  });

  await sendCompanyRegistrationEmail(company.email, company.name);

  res.status(201).json({
    message: "Company registered successfully",
    company
  });
});

// Job Post Management
const createJobPost = asyncHandler(async (req, res) => {
  const {
    companyId,
    title,
    description,
    salaryPackage,
    eligibilityCriteria,
    minimumCGPA,
    deadline,
    positions
  } = req.body;

  authService.validateRequiredFields(
    { companyId, title, description, salaryPackage, eligibilityCriteria },
    ['companyId', 'title', 'description', 'salaryPackage', 'eligibilityCriteria']
  );

  const company = await Company.findById(companyId);
  if (!company) {
    throw new Error("Company not found");
  }

  const jobPost = await JobPost.create({
    company: companyId,
    title,
    description,
    salaryPackage,
    eligibilityCriteria,
    minimumCGPA,
    deadline,
    positions,
    postedBy: req.user.id
  });

  res.status(201).json({
    message: "Job post created successfully",
    jobPost
  });
});

const notifyEligibleStudents = asyncHandler(async (req, res) => {
  const jobPost = await JobPost.findById(req.params.jobId)
    .populate('company');

  if (!jobPost) {
    throw new Error("Job post not found");
  }

  const eligibleStudents = await Student.find({
    isEmailVerified: true,
    cgpa: { $gte: jobPost.minimumCGPA || 0 }
  });

  if (eligibleStudents.length === 0) {
    throw new Error("No eligible students found");
  }

  const notificationPromises = eligibleStudents.map(student =>
    sendJobNotificationEmail(
      student.email,
      student.name,
      jobPost.title,
      jobPost.company.name
    )
  );

  await Promise.all(notificationPromises);

  res.status(200).json({
    message: `Notified ${eligibleStudents.length} eligible students`,
    jobPost: jobPost.title,
    company: jobPost.company.name
  });
});

// Statistics and Analytics
const getPlacementStatistics = asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();
  
  const placements = await JobPost.aggregate([
    {
      $match: {
        status: 'closed',
        createdAt: {
          $gte: new Date(currentYear, 0, 1),
          $lte: new Date(currentYear, 11, 31)
        }
      }
    },
    {
      $lookup: {
        from: 'students',
        localField: 'selectedStudents',
        foreignField: '_id',
        as: 'placedStudents'
      }
    },
    {
      $group: {
        _id: null,
        totalPlacements: { $sum: { $size: '$selectedStudents' } },
        totalPackage: { $sum: '$salaryPackage' },
        highestPackage: { $max: '$salaryPackage' }
      }
    }
  ]);

  const stats = placements[0] || {
    totalPlacements: 0,
    totalPackage: 0,
    highestPackage: 0
  };

  res.status(200).json({
    year: currentYear,
    totalPlacements: stats.totalPlacements,
    averagePackage: stats.totalPlacements ? 
      (stats.totalPackage / stats.totalPlacements).toFixed(2) : 0,
    highestPackage: stats.highestPackage
  });
});

const getStudentStatistics = asyncHandler(async (req, res) => {
  const placedStudents = await Student.aggregate([
    {
      $match: {
        'placementStatus.isPlaced': true
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'placementStatus.company',
        foreignField: '_id',
        as: 'companyDetails'
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        branch: 1,
        cgpa: 1,
        'companyDetails.name': 1,
        'placementStatus.package': 1,
        'placementStatus.placementDate': 1
      }
    }
  ]);

  res.status(200).json(placedStudents.map(student => ({
    studentId: student._id,
    name: student.name,
    email: student.email,
    branch: student.branch,
    cgpa: student.cgpa,
    company: student.companyDetails[0]?.name,
    package: student.placementStatus.package,
    placementDate: student.placementStatus.placementDate
  })));
});

module.exports = {
  registerAdmin,
  loginAdmin,
  registerCompany,
  createJobPost,
  notifyEligibleStudents,
  getPlacementStatistics,
  getStudentStatistics
};
