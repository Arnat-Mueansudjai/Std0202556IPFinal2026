/**
 * Authentication Controller
 * Endpoint: POST /api/login
 * Validates admin / password123 credentials
 */

const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required"
    });
  }

  // Exact credentials required by exam specification
  if (username === "admin" && password === "password123") {
    return res.status(200).json({
      success: true,
      token: "mock-jwt-token"
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid username or password"
  });
};

module.exports = { login };
