/**
 * Employee Controller (CRUD Operations)
 * Supports both MySQL Database and In-Memory Storage seamlessly.
 * Table Name: ArMuean_Employees (configured via process.env.DB_TABLE)
 * 
 * Endpoints:
 * - GET /api/employees
 * - POST /api/employees (handles 400 Bad Request if any field is empty)
 * - PUT /api/employees/:id (update full employee details: name, position, salary, status)
 * - PUT /api/employees/:id/status (toggle Active <-> On Leave - exam required)
 * - DELETE /api/employees/:id
 */

const { getEmployees, setEmployees, getNextId } = require("../data/mockEmployees");
const { getDbStatus, getPool } = require("../config/db");

const TABLE_NAME = process.env.DB_TABLE || "ArMuean_Employees";

// [GET] /api/employees - Return all employee records
const getAllEmployees = async (req, res) => {
  try {
    if (getDbStatus()) {
      const pool = getPool();
      const [rows] = await pool.execute(
        `SELECT id, name, position, status, salary FROM ${TABLE_NAME} ORDER BY id ASC`
      );
      const formatted = rows.map(r => ({
        id: String(r.id),
        name: r.name,
        position: r.position,
        status: r.status,
        salary: Number(r.salary)
      }));
      return res.status(200).json(formatted);
    }

    const employees = getEmployees();
    return res.status(200).json(employees);
  } catch (error) {
    console.error("Error in getAllEmployees:", error);
    return res.status(200).json(getEmployees());
  }
};

// [POST] /api/employees - Add a new employee
// Must receive name, position, and salary. If any field is empty, respond with Status 400 Bad Request.
const addEmployee = async (req, res) => {
  const { name, position, salary } = req.body;

  if (
    !name ||
    typeof name !== "string" ||
    name.trim() === "" ||
    !position ||
    typeof position !== "string" ||
    position.trim() === "" ||
    salary === undefined ||
    salary === null ||
    salary === "" ||
    isNaN(Number(salary)) ||
    Number(salary) < 0
  ) {
    return res.status(400).json({
      error: "Name, position, and a valid positive salary are required."
    });
  }

  const cleanName = name.trim();
  const cleanPosition = position.trim();
  const cleanSalary = Number(salary);

  try {
    if (getDbStatus()) {
      const pool = getPool();
      const [result] = await pool.execute(
        `INSERT INTO ${TABLE_NAME} (name, position, status, salary) VALUES (?, ?, 'Active', ?)`,
        [cleanName, cleanPosition, cleanSalary]
      );
      const newEmployee = {
        id: String(result.insertId),
        name: cleanName,
        position: cleanPosition,
        status: "Active",
        salary: cleanSalary
      };
      return res.status(201).json(newEmployee);
    }

    const newEmployee = {
      id: getNextId(),
      name: cleanName,
      position: cleanPosition,
      status: "Active",
      salary: cleanSalary
    };

    const currentList = getEmployees();
    currentList.push(newEmployee);
    setEmployees(currentList);

    return res.status(201).json(newEmployee);
  } catch (error) {
    console.error("Error in addEmployee:", error);
    return res.status(500).json({ error: "Failed to add employee" });
  }
};

// [PUT] /api/employees/:id - Update full employee details (Edit)
const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { name, position, salary, status } = req.body;

  if (
    !name ||
    typeof name !== "string" ||
    name.trim() === "" ||
    !position ||
    typeof position !== "string" ||
    position.trim() === "" ||
    salary === undefined ||
    salary === null ||
    salary === "" ||
    isNaN(Number(salary)) ||
    Number(salary) < 0
  ) {
    return res.status(400).json({
      error: "Name, position, and a valid positive salary are required."
    });
  }

  const cleanName = name.trim();
  const cleanPosition = position.trim();
  const cleanSalary = Number(salary);
  const cleanStatus = status === "On Leave" ? "On Leave" : "Active";

  try {
    if (getDbStatus()) {
      const pool = getPool();
      const [rows] = await pool.execute(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Employee not found" });
      }

      await pool.execute(
        `UPDATE ${TABLE_NAME} SET name = ?, position = ?, salary = ?, status = ? WHERE id = ?`,
        [cleanName, cleanPosition, cleanSalary, cleanStatus, id]
      );

      return res.status(200).json({
        id: String(id),
        name: cleanName,
        position: cleanPosition,
        status: cleanStatus,
        salary: cleanSalary
      });
    }

    const currentList = getEmployees();
    const employee = currentList.find(e => String(e.id) === String(id));
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    employee.name = cleanName;
    employee.position = cleanPosition;
    employee.salary = cleanSalary;
    employee.status = cleanStatus;

    return res.status(200).json(employee);
  } catch (error) {
    console.error("Error in updateEmployee:", error);
    return res.status(500).json({ error: "Failed to update employee" });
  }
};

// [PUT] /api/employees/:id/status - Toggle employee status (Active <-> On Leave)
const toggleEmployeeStatus = async (req, res) => {
  const { id } = req.params;

  try {
    if (getDbStatus()) {
      const pool = getPool();
      const [rows] = await pool.execute(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const currentStatus = rows[0].status;
      const newStatus = currentStatus === "Active" ? "On Leave" : "Active";

      await pool.execute(`UPDATE ${TABLE_NAME} SET status = ? WHERE id = ?`, [newStatus, id]);

      return res.status(200).json({
        id: String(id),
        name: rows[0].name,
        position: rows[0].position,
        status: newStatus,
        salary: Number(rows[0].salary)
      });
    }

    const currentList = getEmployees();
    const employee = currentList.find(e => String(e.id) === String(id));
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    employee.status = employee.status === "Active" ? "On Leave" : "Active";
    return res.status(200).json(employee);
  } catch (error) {
    console.error("Error in toggleEmployeeStatus:", error);
    return res.status(500).json({ error: "Failed to update status" });
  }
};

// [DELETE] /api/employees/:id - Remove employee from the system
const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    if (getDbStatus()) {
      const pool = getPool();
      const [rows] = await pool.execute(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Employee not found" });
      }

      await pool.execute(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id]);
      return res.status(200).json({
        success: true,
        message: "Employee removed successfully"
      });
    }

    const currentList = getEmployees();
    const index = currentList.findIndex(e => String(e.id) === String(id));
    if (index === -1) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const deletedEmployee = currentList.splice(index, 1)[0];
    setEmployees(currentList);

    return res.status(200).json({
      success: true,
      message: "Employee removed successfully",
      deleted: deletedEmployee
    });
  } catch (error) {
    console.error("Error in deleteEmployee:", error);
    return res.status(500).json({ error: "Failed to delete employee" });
  }
};

module.exports = {
  getAllEmployees,
  addEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  deleteEmployee
};
