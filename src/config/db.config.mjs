import pg from "pg";

// Equivalent to mongoose connection
// Pool is nothing but group of connections
// If you pick one connection out of the pool and release it
// the pooler will keep that connection open for sometime to other clients to reuse
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

pool.on("error", (error) => {
  console.error("Error connecting to the database:", error);
});

export { pool };
