import pg from "pg";
import { configDotenv } from "dotenv";
configDotenv();

const pool = new pg.Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "bookmyticket",
});

const client = await pool.connect();

try {
  await client.query("BEGIN");

  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      age INT NOT NULL CHECK (age >= 18),
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255),
      password VARCHAR(500) NOT NULL,
      refresh_token VARCHAR(500),
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `);
  console.log("users table ready");

  await client.query(`
    CREATE TABLE IF NOT EXISTS seats (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      isbooked BOOLEAN DEFAULT FALSE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT now()
    )
  `);
  console.log("seats table ready");

  // Only seed if seats table is empty
  const { rows } = await client.query("SELECT COUNT(*) FROM seats");
  const count = parseInt(rows[0].count, 10);

  if (count === 0) {
    const placeholders = Array.from(
      { length: 30 },
      (_, i) => `($${i + 1})`,
    ).join(", ");
    const values = Array.from({ length: 30 }, () => false);
    await client.query(
      `INSERT INTO seats (isbooked) VALUES ${placeholders}`,
      values,
    );
  }

  await client.query("COMMIT");
  console.log("\nDatabase setup complete.");
} catch (err) {
  await client.query("ROLLBACK");
  console.error("Setup failed:", err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
