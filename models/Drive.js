const mongoose = require("mongoose");

const driveSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company", // References the Company model
      required: true,
    },
    job_posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobPost", // References the JobPost model for jobs offered in the drive
      },
    ],
    drive_date: {
      type: Date,
      required: true, // The date when the drive will be conducted
    },
    location: {
      type: String,
      required: true, // Campus/location of the drive
    },
    applied_students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student", // References the Student model for those applying to this drive
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TpoAdmin", // References the TPO admin who created the drive
      required: true,
    },
    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"], // Status of the drive
      default: "Upcoming",
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
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

// Export the Drive model
module.exports = mongoose.model("Drive", driveSchema);
