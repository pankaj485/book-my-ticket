import z from "zod";
import { ApiResponse } from "../../common/apierror.mjs";
import {
  bookSingleSeat,
  getAllSeats,
  getSeatStatus,
} from "./booking.service.mjs";
import { validateToken } from "../../middlewares/auth.middleware.mjs";
import { verifyToken } from "../../common/jwt.mjs";

const seatBookingSchema = z.object({
  id: z.coerce.number().positive().describe("user id"),
  name: z.string().describe("user first name"),
});

const getSeats = async (req, res) => {
  try {
    const data = await getAllSeats();

    if (!data) {
      return ApiResponse.badRequest(res, "something went wrong while getting data");
    }

    ApiResponse.success(res, "seats data fetched", data);
  } catch (error) {
    ApiResponse.internal(res, "Error getting seats data");
  }
};

const bookSeat = async (req, res) => {
  try {
    const payload = seatBookingSchema.safeParse(req.params);

    if (!payload.success) {
      return ApiResponse.badRequest(
        res,
        "Invalid data",
        JSON.parse(payload.error?.message),
      );
    }

    const { id, name } = payload.data;

    const token = req.headers.authorization.split(" ")[1];
    const { id: userId, email } = verifyToken(token);

    const result = await getSeatStatus(id);

    if (result && result.length === 0) {
      return ApiResponse.badRequest(res, "Seat already booked");
    }

    const bookingResult = await bookSingleSeat({ name, id, userId });

    if (!bookingResult) {
      return ApiResponse.internal(res, "Something went wrong while booking seat");
    }

    ApiResponse.created(res, `Seat booked by: ${email}`);
  } catch (error) {
    ApiResponse.internal(res, "Error booking seat");
  }
};

export { bookSeat, getSeats };
