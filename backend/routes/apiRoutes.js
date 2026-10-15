/**
 * API Routes Definition
 * All routes mapped under /api prefix
 */

const express = require("express");
const router = express.Router();

const { login } = require("../controllers/authController");
const {
  getAllEmployees,
  addEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  deleteEmployee
} = require("../controllers/employeeController");
const { getSalaryClusters } = require("../controllers/analyticsController");

// Authentication Endpoint
router.post("/login", login);

// Phase 2: K-Means Analytics Endpoint (Must precede any parameterized route)
router.get("/employees/salary-clusters", getSalaryClusters);

// Phase 1: Employee CRUD Endpoints
router.get("/employees", getAllEmployees);
router.post("/employees", addEmployee);
router.put("/employees/:id/status", toggleEmployeeStatus); // Specific status toggle
router.put("/employees/:id", updateEmployee);              // Full edit/update
router.delete("/employees/:id", deleteEmployee);

module.exports = router;
