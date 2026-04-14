import { ApiResponse } from "../common/apierror.mjs";
import { verifyToken } from "../common/jwt.mjs";

const validateUserAuth = (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      return ApiResponse.unauthorized(res, "Authorization token not provided");
    }

    if (!authorization.startsWith("Bearer")) {
      return ApiResponse.unauthorized(
        res,
        "Invalid authorization token format",
      );
    }

    const token = authorization.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return ApiResponse.unauthorized(res, "Invalid token");
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    ApiResponse.internal(res, "Something went wrong while authentication");
  }
};

export { validateUserAuth };
