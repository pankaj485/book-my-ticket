import { pool } from "../../db/db.config.mjs";

const getAllSeats = async () => {
  const { rows } = await pool.query(
    "SELECT s.id, s.isbooked, u.email, u.first_name FROM seats as s LEFT JOIN users as u ON u.id = s.user_id ORDER BY s.id ASC",
  );
  return rows;
};

const bookSeatIfAvailable = async ({ id, userId, name }) => {
  const conn = await pool.connect();
  try {
    await conn.query("BEGIN");

    const { rows: seats } = await conn.query(
      "SELECT * FROM seats WHERE id = $1 FOR UPDATE",
      [id],
    );

    if (seats.length === 0) {
      await conn.query("ROLLBACK");
      return { error: "not_found" };
    }

    if (seats[0].isbooked) {
      await conn.query("ROLLBACK");
      return { error: "already_booked" };
    }

    const { rows: updated } = await conn.query(
      "UPDATE seats SET isbooked = TRUE, user_id = $2, name = $3 WHERE id = $1 RETURNING *",
      [id, userId, name],
    );

    await conn.query("COMMIT");
    return { data: updated[0] };
  } catch (error) {
    await conn.query("ROLLBACK");
    console.error("Error booking seat:", error);
    throw new Error("Failed to book seat");
  } finally {
    conn.release();
  }
};

export { bookSeatIfAvailable, getAllSeats };
