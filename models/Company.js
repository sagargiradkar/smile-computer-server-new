const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true, // Removes unnecessary whitespace
    },
    sector: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      required: false,
    },
    hr_contact: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    job_posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobPost", // References the JobPost model
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TpoAdmin", // Tracks the admin who added the company
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

// Export the Company model
module.exports = mongoose.model("Company", companySchema);
