const mongoose = require("mongoose");

const jobPostSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company", // Reference to the Company model
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    salaryPackage: {
      type: Number,
      required: true, // Salary package offered for the role (e.g., 10 LPA)
    },
    eligibility: {
      cgpa: {
        type: Number,
        required: true, // Minimum required CGPA to apply for the job
        min: 0,
        max: 10,
      },
      branch: {
        type: [String], // Array of eligible branches (e.g., ["CSE", "ECE"])
        required: true,
      },
      placed_status: {
        type: Boolean, // Specifies if students already placed are eligible
        default: false,
      },
    },
    location: {
      type: String,
      required: true, // Job location (e.g., "Hyderabad" or "Remote")
    },
    openings: {
      type: Number, // Number of openings for the role
      default: 1,
    },
    applied_students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student", // References the Student model
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TpoAdmin", // Tracks the admin responsible for creating the job post
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
    timestamps: true, // Automatically manage `createdAt` and `updatedAt`
  }
);

// Export the JobPost model
module.exports = mongoose.model("JobPost", jobPostSchema);
