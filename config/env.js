const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from a `.env` file
const loadEnv = () => {
  const result = dotenv.config({ path: path.resolve(__dirname, "../.env") });
  if (result.error) {
    throw new Error("⚠️ Could not find .env file or there was an error loading it.");
  }
  console.log("✅ Environment variables loaded successfully.");
};

module.exports = loadEnv;
