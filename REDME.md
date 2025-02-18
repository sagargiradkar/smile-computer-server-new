tpo_server/
├── config/
│   ├── db.js            # Database connection configuration
│   ├── email.js         # Nodemailer configuration for email notifications
│   └── env.js           # Environment variables setup (dotenv)
├── controllers/
│   ├── studentController.js    # Handles student-related logic
│   ├── tpoAdminController.js   # Handles TPO-related logic
│   ├── jobPostController.js    # Handles job post creation and management
│   └── companyController.js    # Handles new company registration
├── middlewares/
│   ├── authMiddleware.js       # JWT middleware for authentication
│   └── roleMiddleware.js       # Middleware for role-based authorization (admin & student)
├── models/
│   ├── Student.js        # Student model
│   ├── TpoAdmin.js       # TPO Admin model
│   ├── Company.js        # Company model
│   ├── JobPost.js        # Job post model
│   └── Drive.js          # Drive model
├── routes/
│   ├── studentRoutes.js  # Routes for student-related APIs
│   ├── tpoAdminRoutes.js # Routes for TPO admin-related APIs
│   ├── companyRoutes.js  # Routes for company APIs
│   └── jobPostRoutes.js  # Routes for job post APIs
├── utils/
│   ├── jwtUtils.js       # JWT utility for generating/verifying tokens
│   ├── emailUtils.js     # Email utility for sending notifications
│   └── responseUtils.js  # Standard format for API responses
├── .env                  # Environment variables (e.g., DB URI, JWT Secret)
├── .gitignore            # Ignore files for Git
├── package.json          # NPM dependencies and scripts
├── server.js             # Main entry point of the application
└── README.md             # Documentation for the server
