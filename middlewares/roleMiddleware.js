const asyncHandler = require("express-async-handler");

/**
 * @desc Middleware to restrict access based on user roles
 * @param {...string} allowedRoles - Roles allowed to access the route
 */
const roleMiddleware = (...allowedRoles) => {
  return asyncHandler((req, res, next) => {
    // Ensure the `req.user` object exists (populated by authMiddleware)
    if (!req.user || !req.user.role) {
      res.status(403);
      throw new Error("Access denied. No role found.");
    }

    // Check if the user's role is in the list of allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403);
      throw new Error("Access denied. Insufficient permissions.");
    }

    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = roleMiddleware;
