const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const tpoAdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"]
    },
    
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
        "Please enter a valid email address"
      ]
    },
    
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false // Excludes password from query results by default
    },
    
    contact_number: {
      type: String,
      required: [true, "Contact number is required"],
      match: [
        /^(\+\d{1,3}[- ]?)?\d{10}$/,
        "Please enter a valid contact number"
      ]
    },
    
    designation: {
      type: String,
      default: "Training and Placement Officer",
      trim: true
    },
    
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      enum: {
        values: [
          "Computer Science",
          "Information Technology",
          "Electronics",
          "Electrical",
          "Mechanical",
          "Civil",
          "Chemical",
          "Other"
        ],
        message: "{VALUE} is not a valid department"
      }
    },
    
    role: {
      type: String,
      default: "admin",
      enum: ["admin", "super_admin"],
      immutable: true // Cannot be changed once set
    },
    
    isActive: {
      type: Boolean,
      default: true
    },
    
    lastLogin: {
      type: Date
    },
    
    passwordChangedAt: {
      type: Date
    },
    
    passwordResetToken: String,
    passwordResetExpires: Date,
    
    loginAttempts: {
      type: Number,
      default: 0
    },
    
    accountLocked: {
      type: Boolean,
      default: false
    },
    
    lockUntil: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for optimization
tpoAdminSchema.index({ email: 1 });
tpoAdminSchema.index({ department: 1 });

// Virtual for full designation
tpoAdminSchema.virtual('fullDesignation').get(function() {
  return `${this.designation} - ${this.department} Department`;
});

// Pre-save middleware to hash password
tpoAdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    if (this.isModified('password') && !this.isNew) {
      this.passwordChangedAt = Date.now() - 1000;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
tpoAdminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
tpoAdminSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      role: this.role,
      department: this.department 
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE
    }
  );
};

// Method to handle failed login attempts
tpoAdminSchema.methods.handleFailedLogin = async function() {
  this.loginAttempts += 1;
  
  if (this.loginAttempts >= 5) {
    this.accountLocked = true;
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
  }
  
  await this.save();
};

// Method to reset login attempts
tpoAdminSchema.methods.resetLoginAttempts = async function() {
  this.loginAttempts = 0;
  this.accountLocked = false;
  this.lockUntil = undefined;
  await this.save();
};

// Method to create password reset token
tpoAdminSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Static method to get active admins by department
tpoAdminSchema.statics.getActiveAdminsByDepartment = function(department) {
  return this.find({ department, isActive: true })
    .select('-password')
    .sort('name');
};

// Query middleware to exclude inactive admins
tpoAdminSchema.pre(/^find/, function(next) {
  this.find({ isActive: { $ne: false } });
  next();
});

const TpoAdmin = mongoose.model("TpoAdmin", tpoAdminSchema);

module.exports = TpoAdmin;
