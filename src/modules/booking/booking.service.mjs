import { pool } from "../../db/db.config.mjs";

const getAllSeats = async () => {
  try {
    const result = await pool.query("SELECT * FROM seats ORDER BY id ASC"); // equivalent to Seats.find() in mongoose
    const data = result.rows;

    return data;
  } catch (error) {
    console.error("Error getting seats data", error);
    return false;
  }
};

const getSeatStatus = async (id) => {
  try {
    const conn = await pool.connect(); // pick a connection from the pool
    await conn.query("BEGIN");

    const { rows } = await conn.query(
      "SELECT * FROM seats where id = $1 and isbooked = false FOR UPDATE",
      [id],
    );

    //end transaction by committing
    await conn.query("COMMIT");
    conn.release();

    return rows;
  } catch (error) {
    console.error("something went wrong while booking seat");

    return null;
  }
};

const bookSingleSeat = async ({ id, userId }) => {
  try {
    const conn = await pool.connect(); // pick a connection from the pool

    await conn.query("BEGIN");

    const { rows } = await conn.query(
      "UPDATE seats SET isbooked = TRUE, user_id = $2 WHERE id = $1 RETURNING *",
      [id, userId],
    );

    await conn.query("COMMIT");
    conn.release();

    return rows;
  } catch (error) {
    console.log(error);
    console.error("Error booking seat", error);
    return null;
  }
};

export { bookSingleSeat, getAllSeats, getSeatStatus };
