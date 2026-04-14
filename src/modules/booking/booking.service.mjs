import { pool } from "../../config/db.config.mjs";

const getAllSeats = async () => {
  try {
    const result = await pool.query("SELECT * FROM seats"); // equivalent to Seats.find() in mongoose
    const data = result.rows;

    return data;
  } catch (error) {
    console.error("Error getting seats data", error);
    return false;
  }
};

export { getAllSeats };
