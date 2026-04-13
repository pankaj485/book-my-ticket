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

pool.on("connect", () => {
  console.log("Connected to the database successfully.");
});
pool.on("acquire", () => {
  console.log("Connection acquired from the pool.");
});
pool.on("error", (error) => {
  console.error("Error connecting to the database:", error);
});

export { pool };
