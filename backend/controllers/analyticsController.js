/**
 * Analytics Controller
 * Endpoint: GET /api/employees/salary-clusters
 * Runs 1D K-Means Clustering (k=3) on all employee salaries
 */

const { getEmployees } = require("../data/mockEmployees");
const { runKMeans1D } = require("../utils/kmeans");
const { getDbStatus, getPool } = require("../config/db");

const TABLE_NAME = process.env.DB_TABLE || "ArMuean_Employees";

const getSalaryClusters = async (req, res) => {
  try {
    let salaries = [];

    if (getDbStatus()) {
      const pool = getPool();
      const [rows] = await pool.execute(`SELECT salary FROM ${TABLE_NAME}`);
      salaries = rows.map(r => Number(r.salary));
    } else {
      const employees = getEmployees();
      salaries = employees.map(emp => Number(emp.salary));
    }

    // Run 1D K-Means clustering (k = 3)
    const clusters = runKMeans1D(salaries, 3);

    return res.status(200).json({
      success: true,
      clusters
    });
  } catch (error) {
    console.error("K-Means Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to compute salary clusters"
    });
  }
};

module.exports = { getSalaryClusters };
