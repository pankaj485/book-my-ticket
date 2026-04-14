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

const getSeatStatus = async (id) => {
  try {
    const conn = await pool.connect(); // pick a connection from the pool
    await conn.query("BEGIN");

    const result = await conn.query(
      "SELECT * FROM seats where id = $1 and isbooked = false FOR UPDATE",
      [id],
    );

    //end transaction by committing
    await conn.query("COMMIT");
    conn.release();

    return result;
  } catch (error) {
    console.error("something went wrong while booking seat");

    return null;
  }
};

const bookSingleSeat = async ({ name, id, userId }) => {
  try {
    const conn = await pool.connect(); // pick a connection from the pool

    await conn.query("BEGIN");

    const updateResult = await conn.query(
      "UPDATE seats SET isbooked = TRUE, user_id = $2 WHERE id = $1",
      [id, userId],
    );

    await conn.query("COMMIT");
    conn.release();

    return updateResult;
  } catch (error) {
    console.log(error);
    console.error("Error booking seat");
    return null;
  }
};

export { bookSingleSeat, getAllSeats, getSeatStatus };
