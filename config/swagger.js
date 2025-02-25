const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger definition
const swaggerDefinition = {
  openapi: "3.0.0", // Version of OpenAPI
  info: {
    title: "Smile Computer Education", // API Title
    version: "1.0.0", // API version
    description: "API documentation for the Smile Computer Education", // API description
  },
  servers: [
    {
      url: "http://localhost:4000", // Your server URL (adjust port if needed)
      description: "Local server",
    },
  ],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  apis: ["./routes/*.js"], // Path to the API route files with JSDoc comments
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };
