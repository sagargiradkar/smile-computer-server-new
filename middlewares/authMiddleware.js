const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Student = require("../models/Student");
const TpoAdmin = require("../models/TpoAdmin");

/**
 * @desc Middleware to verify JWT and authenticate the user
 * @access Protected
 */
const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  // Check if the token is provided in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Extract the token
      token = req.headers.authorization.split(" ")[1]; // Get the token after "Bearer"

      // Verify the token and decode the payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check the user's role and find the user in the database
      if (decoded.role === "student") {
        req.user = await Student.findById(decoded.id).select("-password"); // Remove password field
      } else if (decoded.role === "admin") {
        req.user = await TpoAdmin.findById(decoded.id).select("-password"); // Remove password field
      } else {
        res.status(403);
        throw new Error("Unauthorized role.");
      }

      if (!req.user) {
        res.status(401);
        throw new Error("User not found.");
      }

      next(); // Proceed to the next middleware or route
    } catch (error) {
      console.error(error.message);
      res.status(401);
      throw new Error("Invalid token. Authentication failed.");
    }
  }

  // If no token is provided
  if (!token) {
    res.status(401);
    throw new Error("No token provided. Authentication denied.");
  }
});

module.exports = authMiddleware;
