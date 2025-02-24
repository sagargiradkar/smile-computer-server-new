const asyncHandler = require("express-async-handler");

const roleMiddleware = (requiredRole) => {
  return asyncHandler(async (req, res, next) => {
    console.log("Checking Role in Middleware:", req.user); // Debug log

    if (!req.user || !req.user.role) {
      console.error("Unauthorized access attempt - No role found");
      return res.status(401).json({ message: "Access denied. No role found." });
    }

    if (req.user.role !== requiredRole) {
      console.error(`Unauthorized access attempt - Role mismatch. Required: ${requiredRole}, Found: ${req.user.role}`);
      return res.status(403).json({ message: "Forbidden. Insufficient role privileges." });
    }

    console.log("Role authorized ✅");
    next(); // Proceed if role matches
  });
};

module.exports = roleMiddleware;
