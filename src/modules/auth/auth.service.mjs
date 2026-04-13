import { pool } from "../../config/db.config.mjs";

const getUserByEmail = async (email) => {
  try {
    const data = [email];
    const { rows } = await pool.query(
      "SELECT email FROM users WHERE email = $1",
      data,
    );

    return rows[0];
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw new Error("Failed to fetch user by email");
  }
};

const addUserRecord = async ({
  email,
  first_name,
  last_name,
  age,
  password,
}) => {
  try {
    const data = [email, first_name, last_name, age, password];

    const { rows } = await pool.query(
      "INSERT INTO users (email, first_name, last_name, age, password) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      data,
    );

    return rows[0];
  } catch (error) {
    console.error("Error inserting user record:", error);
    throw new Error("Failed to insert user record");
  }
};

export { addUserRecord, getUserByEmail };
