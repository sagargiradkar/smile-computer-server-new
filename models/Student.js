const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  address: {
    type: String, // Address is optional
  },
  profilePhoto: {
    type: String, // Stores URL of the profile picture
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  otp: String,
  otpExpiry: Date,
  otpType: {
    type: String,
    enum: ["registration", "login", "reset"],
  },
  otpAttempts: {
    type: Number,
    default: 0,
  },
  accountLocked: {
    type: Boolean,
    default: false,
  },
  lockUntil: Date,
});

// Methods for OTP Handling
studentSchema.methods.isOtpValid = function (inputOtp) {
  return this.otp === inputOtp && new Date() < this.otpExpiry;
};

studentSchema.methods.incrementOtpAttempts = async function () {
  this.otpAttempts += 1;
  if (this.otpAttempts >= 3) {
    this.accountLocked = true;
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
  }
  await this.save();
};

studentSchema.methods.clearOtpFields = async function () {
  this.otp = undefined;
  this.otpExpiry = undefined;
  this.otpType = undefined;
  await this.save();
};

studentSchema.methods.resetOtpAttempts = async function () {
  this.otpAttempts = 0;
  this.accountLocked = false;
  this.lockUntil = undefined;
  await this.save();
};

module.exports = mongoose.model("Student", studentSchema);
