/**
 * Authentication Controller
 * Supports role-based authentication with ArMuean_User table (and In-Memory fallback).
 * Roles: admin, hr, staff
 * 
 * Complies strictly with Exam Requirement:
 * When credentials are admin / password123 -> returns Status 200 OK and { success: true, token: "mock-jwt-token" }
 */

const { getDbStatus, getPool } = require("../config/db");

const USER_TABLE = process.env.DB_USER_TABLE || "ArMuean_User";

// In-Memory mock users fallback
const mockUsers = [
  {
    id: "1",
    username: "admin",
    password: "password123",
    role: "admin",
    name: "System Administrator"
  },
  {
    id: "2",
    username: "hr_user",
    password: "hr123",
    role: "hr",
    name: "HR Manager"
  },
  {
    id: "3",
    username: "staff",
    password: "staff123",
    role: "staff",
    name: "General Staff"
  }
];

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required"
    });
  }

  const cleanUsername = String(username).trim();
  const cleanPassword = String(password).trim();

  try {
    if (getDbStatus()) {
      const pool = getPool();
      const [rows] = await pool.execute(
        `SELECT id, username, password, role, name FROM ${USER_TABLE} WHERE username = ?`,
        [cleanUsername]
      );

      if (rows.length > 0 && rows[0].password === cleanPassword) {
        const found = rows[0];
        return res.status(200).json({
          success: true,
          token: "mock-jwt-token",
          user: {
            id: String(found.id),
            username: found.username,
            role: found.role,
            name: found.name
          }
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    // In-memory fallback
    const foundUser = mockUsers.find(
      u => u.username === cleanUsername && u.password === cleanPassword
    );

    if (foundUser) {
      return res.status(200).json({
        success: true,
        token: "mock-jwt-token",
        user: {
          id: foundUser.id,
          username: foundUser.username,
          role: foundUser.role,
          name: foundUser.name
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid username or password"
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication"
    });
  }
};

module.exports = { login, mockUsers };
