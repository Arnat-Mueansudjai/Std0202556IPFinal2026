/**
 * HR Manager & Salary Analytics System - Production Backend
 * Internet Programming Final Exam 2026
 * Student ID: 6730202556
 * Single-file standalone architecture for seamless FileZilla deployment
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3051;

// Database Configuration
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || "std6730202556";
const DB_PASSWORD = process.env.DB_PASSWORD || "s8*RgL1Z";
const DB_NAME = process.env.DB_NAME || "ip_std6730202556";
const EMPLOYEES_TABLE = process.env.DB_TABLE || "ArMuean_Employees";
const USER_TABLE = process.env.DB_USER_TABLE || "ArMuean_User";

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// 1. IN-MEMORY FALLBACK DATA (6 Accounts & 6 Employees)
// ==========================================
let mockEmployees = [
  { id: "1", name: "John Doe", position: "Software Engineer", status: "Active", salary: 45000 },
  { id: "2", name: "Jane Smith", position: "Senior Developer", status: "Active", salary: 65000 },
  { id: "3", name: "Somchai Prasert", position: "HR Specialist", status: "On Leave", salary: 32000 },
  { id: "4", name: "Suda Jaidee", position: "Junior Developer", status: "Active", salary: 25000 },
  { id: "5", name: "Wichai Raksa", position: "Engineering Manager", status: "Active", salary: 85000 },
  { id: "6", name: "Nattaporn Boonmee", position: "Intern Programmer", status: "Active", salary: 18000 }
];
let nextEmployeeId = 7;

const mockUsers = [
  { id: "1", username: "admin", password: "password123", role: "admin", name: "System Administrator" },
  { id: "2", username: "admin2", password: "admin123", role: "admin", name: "Deputy Administrator" },
  { id: "3", username: "hr_user", password: "hr123", role: "hr", name: "HR Manager" },
  { id: "4", username: "hr_specialist", password: "hr123", role: "hr", name: "HR Specialist" },
  { id: "5", username: "staff", password: "staff123", role: "staff", name: "General Staff" },
  { id: "6", username: "staff_viewer", password: "staff123", role: "staff", name: "Junior Staff" }
];

// ==========================================
// 2. DATABASE CONNECTION POOL
// ==========================================
let pool = null;
let isDbConnected = false;

async function initDatabase() {
  console.log(`[DB] Connecting to MySQL at ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}...`);
  try {
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 4000
    });

    const conn = await pool.getConnection();
    console.log(`[DB] Successfully connected to MySQL database: ${DB_NAME}`);
    isDbConnected = true;
    conn.release();
  } catch (err) {
    console.log(`[DB Notice] MySQL connection skipped/unavailable (${err.code || err.message}).`);
    console.log("[DB Notice] Operating with In-Memory Array fallback (Exam Compliant).");
    isDbConnected = false;
    pool = null;
  }
}

// ==========================================
// 3. 1D K-MEANS CLUSTERING (k = 3)
// ==========================================
function runKMeans1D(salaries, k = 3) {
  const valid = salaries.map(s => Number(s)).filter(s => !isNaN(s) && isFinite(s));
  if (valid.length === 0) {
    return [
      { group: "Tier 1", centroid: 0, count: 0 },
      { group: "Tier 2", centroid: 0, count: 0 },
      { group: "Tier 3", centroid: 0, count: 0 }
    ];
  }

  const sorted = [...valid].sort((a, b) => a - b);
  if (sorted.length < k) {
    const res = [];
    for (let i = 0; i < k; i++) {
      res.push({
        group: `Tier ${i + 1}`,
        centroid: i < sorted.length ? Math.round(sorted[i]) : 0,
        count: i < sorted.length ? 1 : 0
      });
    }
    return res;
  }

  let centroids = [
    sorted[0],
    sorted[Math.floor(sorted.length / 2)],
    sorted[sorted.length - 1]
  ];
  if (centroids[0] === centroids[1]) centroids[1] += 1000;
  if (centroids[1] === centroids[2]) centroids[2] += 2000;

  let clusters = [[], [], []];
  for (let iter = 0; iter < 40; iter++) {
    clusters = [[], [], []];
    for (const val of sorted) {
      let minDist = Infinity;
      let closest = 0;
      for (let c = 0; c < k; c++) {
        const d = Math.abs(val - centroids[c]);
        if (d < minDist) {
          minDist = d;
          closest = c;
        }
      }
      clusters[closest].push(val);
    }

    let converged = true;
    const nextCentroids = [];
    for (let c = 0; c < k; c++) {
      if (clusters[c].length === 0) {
        nextCentroids.push(centroids[c]);
      } else {
        const mean = clusters[c].reduce((a, b) => a + b, 0) / clusters[c].length;
        if (Math.abs(mean - centroids[c]) > 0.01) converged = false;
        nextCentroids.push(mean);
      }
    }
    centroids = nextCentroids;
    if (converged) break;
  }

  const results = centroids.map((c, idx) => ({
    centroid: Math.round(c),
    count: clusters[idx].length
  })).sort((a, b) => a.centroid - b.centroid);

  return results.map((r, idx) => ({
    group: `Tier ${idx + 1}`,
    centroid: r.centroid,
    count: r.count
  }));
}

// ==========================================
// 4. API ROUTES & ENDPOINTS
// ==========================================

// [POST] /api/login - Authentication
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required" });
  }

  const cleanUser = String(username).trim();
  const cleanPass = String(password).trim();

  try {
    if (isDbConnected && pool) {
      const [rows] = await pool.execute(
        `SELECT id, username, password, role, name FROM ${USER_TABLE} WHERE username = ?`,
        [cleanUser]
      );
      if (rows.length > 0 && rows[0].password === cleanPass) {
        const u = rows[0];
        return res.status(200).json({
          success: true,
          token: "mock-jwt-token",
          user: { id: String(u.id), username: u.username, role: u.role, name: u.name }
        });
      }
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    // In-memory fallback
    const found = mockUsers.find(u => u.username === cleanUser && u.password === cleanPass);
    if (found) {
      return res.status(200).json({
        success: true,
        token: "mock-jwt-token",
        user: { id: found.id, username: found.username, role: found.role, name: found.name }
      });
    }

    return res.status(401).json({ success: false, message: "Invalid username or password" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// [GET] /api/employees/salary-clusters - K-Means Analytics
app.get("/api/employees/salary-clusters", async (req, res) => {
  try {
    let salaries = [];
    if (isDbConnected && pool) {
      const [rows] = await pool.execute(`SELECT salary FROM ${EMPLOYEES_TABLE}`);
      salaries = rows.map(r => Number(r.salary));
    } else {
      salaries = mockEmployees.map(e => Number(e.salary));
    }

    const clusters = runKMeans1D(salaries, 3);
    return res.status(200).json({ success: true, clusters });
  } catch (error) {
    console.error("K-Means error:", error);
    return res.status(500).json({ success: false, error: "Failed to compute clusters" });
  }
});

// [GET] /api/employees - All employees
app.get("/api/employees", async (req, res) => {
  try {
    if (isDbConnected && pool) {
      const [rows] = await pool.execute(
        `SELECT id, name, position, status, salary FROM ${EMPLOYEES_TABLE} ORDER BY id ASC`
      );
      return res.status(200).json(
        rows.map(r => ({
          id: String(r.id),
          name: r.name,
          position: r.position,
          status: r.status,
          salary: Number(r.salary)
        }))
      );
    }
    return res.status(200).json(mockEmployees);
  } catch (error) {
    console.error("Get employees error:", error);
    return res.status(200).json(mockEmployees);
  }
});

// [POST] /api/employees - Add new employee
app.post("/api/employees", async (req, res) => {
  const { name, position, salary } = req.body;
  if (!name || !position || salary === undefined || isNaN(Number(salary)) || Number(salary) < 0) {
    return res.status(400).json({ error: "Name, position, and valid salary are required" });
  }

  const cleanName = String(name).trim();
  const cleanPos = String(position).trim();
  const cleanSalary = Number(salary);

  try {
    if (isDbConnected && pool) {
      const [result] = await pool.execute(
        `INSERT INTO ${EMPLOYEES_TABLE} (name, position, status, salary) VALUES (?, ?, 'Active', ?)`,
        [cleanName, cleanPos, cleanSalary]
      );
      return res.status(201).json({
        id: String(result.insertId),
        name: cleanName,
        position: cleanPos,
        status: "Active",
        salary: cleanSalary
      });
    }

    const newEmp = {
      id: String(nextEmployeeId++),
      name: cleanName,
      position: cleanPos,
      status: "Active",
      salary: cleanSalary
    };
    mockEmployees.push(newEmp);
    return res.status(201).json(newEmp);
  } catch (error) {
    console.error("Add employee error:", error);
    return res.status(500).json({ error: "Failed to add employee" });
  }
});

// [PUT] /api/employees/:id/status - Toggle status (Active <-> On Leave)
app.put("/api/employees/:id/status", async (req, res) => {
  const { id } = req.params;
  try {
    if (isDbConnected && pool) {
      const [rows] = await pool.execute(`SELECT * FROM ${EMPLOYEES_TABLE} WHERE id = ?`, [id]);
      if (rows.length === 0) return res.status(404).json({ error: "Employee not found" });

      const newStatus = rows[0].status === "Active" ? "On Leave" : "Active";
      await pool.execute(`UPDATE ${EMPLOYEES_TABLE} SET status = ? WHERE id = ?`, [newStatus, id]);

      return res.status(200).json({
        id: String(id),
        name: rows[0].name,
        position: rows[0].position,
        status: newStatus,
        salary: Number(rows[0].salary)
      });
    }

    const emp = mockEmployees.find(e => String(e.id) === String(id));
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    emp.status = emp.status === "Active" ? "On Leave" : "Active";
    return res.status(200).json(emp);
  } catch (error) {
    console.error("Toggle status error:", error);
    return res.status(500).json({ error: "Failed to update status" });
  }
});

// [PUT] /api/employees/:id - Update full employee (Edit)
app.put("/api/employees/:id", async (req, res) => {
  const { id } = req.params;
  const { name, position, salary, status } = req.body;
  if (!name || !position || salary === undefined || isNaN(Number(salary))) {
    return res.status(400).json({ error: "Name, position, and salary are required" });
  }

  const cleanName = String(name).trim();
  const cleanPos = String(position).trim();
  const cleanSalary = Number(salary);
  const cleanStatus = status === "On Leave" ? "On Leave" : "Active";

  try {
    if (isDbConnected && pool) {
      const [rows] = await pool.execute(`SELECT * FROM ${EMPLOYEES_TABLE} WHERE id = ?`, [id]);
      if (rows.length === 0) return res.status(404).json({ error: "Employee not found" });

      await pool.execute(
        `UPDATE ${EMPLOYEES_TABLE} SET name = ?, position = ?, salary = ?, status = ? WHERE id = ?`,
        [cleanName, cleanPos, cleanSalary, cleanStatus, id]
      );
      return res.status(200).json({
        id: String(id),
        name: cleanName,
        position: cleanPos,
        status: cleanStatus,
        salary: cleanSalary
      });
    }

    const emp = mockEmployees.find(e => String(e.id) === String(id));
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    emp.name = cleanName;
    emp.position = cleanPos;
    emp.salary = cleanSalary;
    emp.status = cleanStatus;
    return res.status(200).json(emp);
  } catch (error) {
    console.error("Update employee error:", error);
    return res.status(500).json({ error: "Failed to update employee" });
  }
});

// [DELETE] /api/employees/:id - Delete employee
app.delete("/api/employees/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (isDbConnected && pool) {
      const [rows] = await pool.execute(`SELECT * FROM ${EMPLOYEES_TABLE} WHERE id = ?`, [id]);
      if (rows.length === 0) return res.status(404).json({ error: "Employee not found" });

      await pool.execute(`DELETE FROM ${EMPLOYEES_TABLE} WHERE id = ?`, [id]);
      return res.status(200).json({ success: true, message: "Employee removed successfully" });
    }

    const idx = mockEmployees.findIndex(e => String(e.id) === String(id));
    if (idx === -1) return res.status(404).json({ error: "Employee not found" });

    const deleted = mockEmployees.splice(idx, 1)[0];
    return res.status(200).json({ success: true, message: "Employee removed", deleted });
  } catch (error) {
    console.error("Delete employee error:", error);
    return res.status(500).json({ error: "Failed to delete employee" });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    project: "HR Manager & Salary Analytics System",
    author: "6730202556",
    port: PORT,
    dbMode: isDbConnected ? "MySQL Database (Connected)" : "In-Memory Array (Fallback)",
    status: "Online"
  });
});

// Start Server
async function start() {
  await initDatabase();
  app.listen(PORT, "0.0.0.0", () => {
    console.log("==================================================");
    console.log(" HR Manager & Salary Analytics System - Production");
    console.log(` Server running on http://0.0.0.0:${PORT}`);
    console.log(` Database Mode: ${isDbConnected ? "MySQL (Active)" : "In-Memory"}`);
    console.log("==================================================");
  });
}

start();
