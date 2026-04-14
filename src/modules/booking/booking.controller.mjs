import z from "zod";
import { ApiResponse } from "../../common/apierror.mjs";
import { bookSeatIfAvailable, getAllSeats } from "./booking.service.mjs";

const seatBookingSchema = z.object({
  id: z.coerce.number().positive().describe("seat id"),
  name: z.string().describe("user first name"),
});

const getSeats = async (req, res) => {
  try {
    const data = await getAllSeats();
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

    const { id } = payload.data;
    const { id: userId, email } = req.user;

    const result = await bookSeatIfAvailable({ id, userId });

    if (result.error === "not_found") {
      return ApiResponse.badRequest(res, "Requested seat not available.");
    }

    if (result.error === "already_booked") {
      return ApiResponse.badRequest(res, "Requested seat already booked.");
    }

    ApiResponse.created(res, `Seat booked by: ${email}`);
  } catch (error) {
    ApiResponse.internal(res, "Error booking seat");
  }
};

export { bookSeat, getSeats };
