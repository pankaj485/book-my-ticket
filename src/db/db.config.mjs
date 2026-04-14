import pg from "pg";

const pool = new pg.Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "password",
  database: "bookmyticket",
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
