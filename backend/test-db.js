const mysql = require("mysql2/promise");
require("dotenv").config();

async function testConnection(host) {
  console.log(`Testing connection to ${host}...`);
  try {
    const connection = await mysql.createConnection({
      host: host,
      user: process.env.DB_USER || "std6730202556",
      password: process.env.DB_PASSWORD || "s8*RgL1Z",
      database: process.env.DB_NAME || "ip_std6730202556",
      connectTimeout: 5000
    });
    console.log(`[SUCCESS] Connected to MySQL on ${host}!`);
    const tableName = process.env.DB_TABLE || "ArMuean_Employees";
    const [rows] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 5`);
    console.log(`Sample data from ${tableName}:`, rows);
    await connection.end();
    return true;
  } catch (err) {
    console.log(`[FAILED] ${host}: ${err.message}`);
    return false;
  }
}

async function main() {
  const hosts = [process.env.DB_HOST || "119.59.102.161", "localhost", "127.0.0.1"];
  for (const h of hosts) {
    await testConnection(h);
  }
}

main();
