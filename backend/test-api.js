/**
 * Backend API Verification Test Script
 * Tests all required endpoints according to the Final Exam Rubric
 */

const http = require("http");

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on("error", reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=== STARTING BACKEND API VERIFICATION ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. POST /api/login (Valid)
    const validLogin = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/login",
        method: "POST",
        headers: { "Content-Type": "application/json" }
      },
      { username: "admin", password: "password123" }
    );
    assert(
      validLogin.status === 200 && validLogin.body?.token === "mock-jwt-token",
      "POST /api/login with valid credentials returns 200 & mock-jwt-token"
    );

    // 2. POST /api/login (Invalid)
    const invalidLogin = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/login",
        method: "POST",
        headers: { "Content-Type": "application/json" }
      },
      { username: "admin", password: "wrongpassword" }
    );
    assert(
      invalidLogin.status === 401 && invalidLogin.body?.success === false,
      "POST /api/login with invalid credentials returns 401 Unauthorized"
    );

    // 3. GET /api/employees
    const getEmps = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/employees",
      method: "GET"
    });
    assert(
      getEmps.status === 200 && Array.isArray(getEmps.body) && getEmps.body.length >= 5,
      `GET /api/employees returns 200 and >= 5 employees (Found ${getEmps.body?.length})`
    );

    // Check schema of first employee
    const firstEmp = getEmps.body[0];
    assert(
      firstEmp &&
        typeof firstEmp.id === "string" &&
        typeof firstEmp.name === "string" &&
        typeof firstEmp.position === "string" &&
        (firstEmp.status === "Active" || firstEmp.status === "On Leave") &&
        typeof firstEmp.salary === "number",
      "Employee schema matches: { id, name, position, status, salary }"
    );

    // 4. POST /api/employees (Bad Request with missing fields)
    const badEmp = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/employees",
        method: "POST",
        headers: { "Content-Type": "application/json" }
      },
      { name: "Incomplete" }
    );
    assert(
      badEmp.status === 400 && badEmp.body?.error,
      "POST /api/employees with missing fields returns 400 Bad Request"
    );

    // 5. POST /api/employees (Valid new employee)
    const addEmp = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/employees",
        method: "POST",
        headers: { "Content-Type": "application/json" }
      },
      { name: "Test User", position: "QA Engineer", salary: 38000 }
    );
    assert(
      addEmp.status === 201 &&
        addEmp.body?.name === "Test User" &&
        addEmp.body?.salary === 38000 &&
        addEmp.body?.status === "Active",
      "POST /api/employees adds new employee and returns 201 Created"
    );
    const newEmpId = addEmp.body?.id;

    // 6. PUT /api/employees/:id/status (Toggle status)
    const toggleStatus = await request({
      hostname: "localhost",
      port: 5000,
      path: `/api/employees/${newEmpId}/status`,
      method: "PUT"
    });
    assert(
      toggleStatus.status === 200 && toggleStatus.body?.status === "On Leave",
      "PUT /api/employees/:id/status toggles status from Active to On Leave"
    );

    // 7. DELETE /api/employees/:id (Remove employee)
    const deleteEmp = await request({
      hostname: "localhost",
      port: 5000,
      path: `/api/employees/${newEmpId}`,
      method: "DELETE"
    });
    assert(
      deleteEmp.status === 200 && deleteEmp.body?.success === true,
      "DELETE /api/employees/:id removes employee and returns 200"
    );

    // 8. GET /api/employees/salary-clusters (K-Means Analytics Phase 2)
    const clusters = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/employees/salary-clusters",
      method: "GET"
    });
    assert(
      clusters.status === 200 &&
        clusters.body?.success === true &&
        Array.isArray(clusters.body?.clusters) &&
        clusters.body?.clusters.length === 3,
      "GET /api/employees/salary-clusters returns 200 and 3 Tier clusters"
    );

    console.log("\nK-Means Cluster Output Preview:", JSON.stringify(clusters.body?.clusters, null, 2));

    console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  }
}

runTests();
