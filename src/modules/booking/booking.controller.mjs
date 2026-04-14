import { ApiResponse } from "../../common/apierror.mjs";
import { getAllSeats } from "./booking.service.mjs";

const getSeats = async (req, res) => {
  try {
    const data = await getAllSeats();

    if (!data) {
      ApiResponse.badRequest(res, "something went wrong while getting data");
    }

    ApiResponse.success(res, "seats data fetched", data);
  } catch (error) {
    ApiResponse.internal(res, "Error getting seats data");
  }
};

export { getSeats };
