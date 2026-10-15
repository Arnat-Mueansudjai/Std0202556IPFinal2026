/**
 * Server Entry Point
 * Internet Programming Final Exam 2026
 * Topic: HR Manager & Salary Analytics System
 * Student ID: 6730202556
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/apiRoutes");
const { initDb, getDbStatus } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount all API endpoints under /api
app.use("/api", apiRoutes);

// Health check / root status endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    project: "HR Manager & Salary Analytics System",
    exam: "Final Exam: Internet Programming (2026)",
    author: "6730202556",
    status: "Running",
    storageMode: getDbStatus() ? "MySQL Database (Active)" : "In-Memory Array (Exam Standard)",
    database: process.env.DB_NAME || "ip_std6730202556",
    endpoints: {
      auth: "POST /api/login",
      employees: "GET, POST /api/employees",
      statusToggle: "PUT /api/employees/:id/status",
      delete: "DELETE /api/employees/:id",
      salaryClusters: "GET /api/employees/salary-clusters"
    }
  });
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start Server after DB initialization check
async function startServer() {
  await initDb();

  app.listen(PORT, "0.0.0.0", () => {
    console.log("==================================================");
    console.log(" HR Manager & Salary Analytics System - Backend");
    console.log(` Server is running on http://localhost:${PORT}`);
    console.log(` Mode: ${getDbStatus() ? "MySQL Database" : "In-Memory Array"}`);
    console.log(" Network accessibility: 0.0.0.0:" + PORT);
    console.log("==================================================");
  });
}

startServer();
