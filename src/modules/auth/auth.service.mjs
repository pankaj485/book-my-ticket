import { pool } from "../../db/db.config.mjs";

const getUserByEmail = async (email) => {
  const conn = await pool.connect();
  try {
    await conn.query("BEGIN");
    const { rows } = await conn.query(
      "SELECT id, email, password FROM users WHERE email = $1",
      [email],
    );
    await conn.query("COMMIT");
    return rows[0];
  } catch (error) {
    await conn.query("ROLLBACK");
    console.error("Error fetching user by email:", error);
    throw new Error("Failed to fetch user by email");
  } finally {
    conn.release();
  }
};

const addUserRecord = async ({ email, first_name, last_name, age, password }) => {
  const conn = await pool.connect();
  try {
    await conn.query("BEGIN");
    const { rows } = await conn.query(
      "INSERT INTO users (email, first_name, last_name, age, password) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, age",
      [email, first_name, last_name, age, password],
    );
    await conn.query("COMMIT");
    return rows[0];
  } catch (error) {
    await conn.query("ROLLBACK");
    console.error("Error inserting user record:", error);
    throw new Error("Failed to insert user record");
  } finally {
    conn.release();
  }
};

const updateUserRefreshToken = async ({ email, token }) => {
  const conn = await pool.connect();
  try {
    await conn.query("BEGIN");
    await conn.query(
      "UPDATE users SET refresh_token = $1 WHERE email = $2",
      [token, email],
    );
    await conn.query("COMMIT");
    return true;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.error("Error updating user refresh token:", error);
    return null;
  } finally {
    conn.release();
  }
};

export { addUserRecord, getUserByEmail, updateUserRefreshToken };
