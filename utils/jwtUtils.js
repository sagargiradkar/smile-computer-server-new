const jwt = require("jsonwebtoken");

/**
 * @desc Generate a JWT token
 * @param {Object} payload - The data to include in the token (e.g., user ID and role)
 * @param {String} expiresIn - The token expiration time (e.g., "1h" or "7d")
 * @returns {String} - The signed JWT token
 */
const generateToken = (payload, expiresIn = "7d") => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * @desc Verify a JWT token
 * @param {String} token - The token to verify
 * @returns {Object} - Decoded token data if valid
 */
const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

/**
 * @desc Decode a JWT token without verifying
 * @param {String} token - The token to decode
 * @returns {Object} - Decoded token payload
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
};
