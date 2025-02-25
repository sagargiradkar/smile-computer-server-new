const mongoose = require("mongoose");

// Define the Profile schema
const profileSchema = new mongoose.Schema({
	gender: {
		type: String,
	},
	dateOfBirth: {
		type: String,
	},
	about: {
		type: String,
		trim: true,
	},
	contactNumber: {
		type: String, // Changed from Number to String
		trim: true,
		required: true, // Make it required
		match: [/^\d{10}$/, "Please enter a valid 10-digit contact number"], // Validate 10-digit number
	},
});

// Export the Profile model
module.exports = mongoose.model("Profile", profileSchema);
