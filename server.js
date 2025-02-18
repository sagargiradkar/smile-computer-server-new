// Import required packages
const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");
const cors = require("cors");
const { swaggerUi, swaggerSpec } = require("./config/swagger");
// Initialize the app
const app = express();

// Load environment variables
dotenv.config({ path: "./config/env.js" });

// Connect to the database
const connectDatabase = require("./config/db");
connectDatabase();

// Apply middlewares
app.use(express.json()); // Parse incoming JSON requests
app.use(cors()); // Enable Cross-Origin Resource Sharing
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // Log HTTP requests in development mode
}

// Base route for health check
app.get("/", (req, res) => {
  res.send("TPO Server is running...");
});

// Import routes
const studentRoutes = require("./routes/studentRoutes");
const tpoAdminRoutes = require("./routes/tpoAdminRoutes");
const companyRoutes = require("./routes/companyRoutes");
const jobPostRoutes = require("./routes/jobPostRoutes");

// Register routes
app.use("/api/student", studentRoutes);
app.use("/api/tpo-admin", tpoAdminRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/job-post", jobPostRoutes);
// Serve Swagger UI at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});
