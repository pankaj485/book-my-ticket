import { ApiResponse } from "../common/apierror.mjs";
import { verifyToken } from "../common/jwt.mjs";

const validateToken = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      ApiResponse.unauthorized(res, "Authorization token not provided");
    }

    if (!authorization.startsWith("Bearer")) {
      ApiResponse.unauthorized(res, "Invalid authorization token format");
    }

    const token = authorization.split(" ")[1];

    if (!verifyToken(token)) {
      ApiResponse.unauthorized(res, "Invalid token");
    }

    next();
  } catch (error) {
    console.log(error);
    ApiResponse.internal(res, "Something went wrong while authentication");
  }
};

export { validateToken };
