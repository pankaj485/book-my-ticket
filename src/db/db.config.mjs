import pg from "pg";
import { configDotenv } from "dotenv";
configDotenv();

const pool = new pg.Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "bookmyticket",
  max: 20,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0,
});

pool.connect().then((client) => {
  console.log("Connected to the database successfully.");
  client.release();
});

pool.on("error", (error) => {
  console.error("Error connecting to the database:", error);
});

export { pool };
