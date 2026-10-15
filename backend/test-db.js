const mysql = require("mysql2/promise");

async function testConnection(host) {
  console.log(`Testing connection to ${host}...`);
  try {
    const connection = await mysql.createConnection({
      host: host,
      user: "std6730202556",
      password: "s8*RgL1Z",
      database: "ip_std6730202556",
      connectTimeout: 5000
    });
    console.log(`[SUCCESS] Connected to MySQL on ${host}!`);
    const [rows] = await connection.execute("SELECT * FROM employees LIMIT 5");
    console.log("Sample employees:", rows);
    await connection.end();
    return true;
  } catch (err) {
    console.log(`[FAILED] ${host}: ${err.message}`);
    return false;
  }
}

async function main() {
  const hosts = ["119.59.102.161", "localhost", "127.0.0.1"];
  for (const h of hosts) {
    await testConnection(h);
  }
}

main();
