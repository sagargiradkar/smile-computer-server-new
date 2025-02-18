const mongoose = require("mongoose");

const tpoAdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensures no duplicate email addresses
    },
    password: {
      type: String,
      required: true,
    },
    contact_number: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      default: "Training and Placement Officer",
    },
    department: {
      type: String,
      required: true, // Department (e.g., Computer Science, ECE, etc.)
    },
    role: {
      type: String,
      default: "admin", // Fixed role for TPO Admin
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

// Export the TpoAdmin model
module.exports = mongoose.model("TpoAdmin", tpoAdminSchema);
