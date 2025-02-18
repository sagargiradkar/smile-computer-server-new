/**
 * @desc Generate a success response
 * @param {Object} res - Express response object
 * @param {String} message - Success message
 * @param {Object} [data={}] - Data payload (optional)
 * @param {Number} [statusCode=200] - HTTP status code (default: 200)
 */
const sendSuccessResponse = (res, message, data = {}, statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message: message,
      data: data,
    });
  };
  
  /**
   * @desc Generate an error response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   * @param {Number} [statusCode=400] - HTTP status code (default: 400)
   * @param {Object} [errorDetails={}] - Error details (optional)
   */
  const sendErrorResponse = (res, message, statusCode = 400, errorDetails = {}) => {
    return res.status(statusCode).json({
      success: false,
      message: message,
      error: errorDetails,
    });
  };
  
  module.exports = {
    sendSuccessResponse,
    sendErrorResponse,
  };
  