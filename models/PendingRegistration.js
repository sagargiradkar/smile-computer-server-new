const mongoose = require("mongoose");

const pendingRegistrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },
  otp: { type: String, required: true },
  otpExpiry: { type: Date, required: true }
}, { timestamps: true });

const PendingRegistration = mongoose.model("PendingRegistration", pendingRegistrationSchema);
module.exports = PendingRegistration;
