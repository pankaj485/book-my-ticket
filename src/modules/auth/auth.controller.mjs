import z from "zod";
import { ApiResponse } from "../../common/apierror.mjs";
import { generateToken, genrateHash } from "../../common/jwt.mjs";
import {
  addUserRecord,
  getUserByEmail,
  updateUserRefreshToken,
} from "./auth.service.mjs";

const userRegistrationSchema = z.object({
  email: z.email().describe("Please provide a valid email address"),
  password: z
    .string()
    .min(6)
    .describe("Password should be at least 6 characters long"),
  first_name: z
    .string()
    .min(3)
    .describe("First name should be at least 3 characters long"),
  last_name: z
    .string()
    .min(3)
    .describe("Last name should be at least 3 characters long"),
  age: z
    .number()
    .min(18)
    .describe("You must be at least 18 years old to sign up"),
});

const userLoginSchema = z.object({
  email: z.email().describe("Please provide a valid email address"),
  password: z
    .string()
    .min(6)
    .describe("Password should be at least 6 characters long"),
});

const signup = async (req, res) => {
  try {
    const payload = userRegistrationSchema.safeParse(req.body);

    if (!payload.success) {
      return ApiResponse.badRequest(
        res,
        "Validation failed",
        JSON.parse(payload.error?.message),
      );
    }

    const userExists = await getUserByEmail(payload.data.email);

    if (userExists) {
      return ApiResponse.badRequest(
        res,
        "User with this email already exists",
      );
    }

    payload.data.password = genrateHash(payload.data.password);

    const userData = await addUserRecord(payload.data);

    if (!userData) {
      return ApiResponse.internal(res, "Failed to create user");
    }

    ApiResponse.created(res, "Sign-up successful", userData);
  } catch (error) {
    console.error("Error during sign-up:", error);
    ApiResponse.internal(res, "Internal server error");
  }
};

const signin = async (req, res) => {
  try {
    const payload = userLoginSchema.safeParse(req.body);

    if (!payload.success) {
      return ApiResponse.badRequest(
        res,
        "Invalid data",
        JSON.parse(payload.error?.message),
      );
    }

    const userData = await getUserByEmail(payload.data.email);

    if (!userData) {
      return ApiResponse.badRequest(res, "Invalid email or password");
    }

    const hashedPassword = genrateHash(payload.data.password);

    if (hashedPassword !== userData.password) {
      return ApiResponse.badRequest(res, "Invalid email or password");
    }

    const refresh_token = generateToken({
      payload: { id: userData.id, email: userData.email },
      expiresIn: "24h",
    });

    const access_token = generateToken({
      payload: { id: userData.id, email: userData.email },
      expiresIn: "15m",
    });

    if (!access_token || !refresh_token) {
      return ApiResponse.internal(res, "Sign-in failed. Please try again.");
    }

    const rfTokenUpdate = await updateUserRefreshToken({
      email: userData.email,
      token: refresh_token,
    });

    if (!rfTokenUpdate) {
      return ApiResponse.internal(res, "Sign-in failed. Please try again.");
    }

    delete userData.password;

    const data = {
      userData,
      refresh_token,
      access_token,
    };

    ApiResponse.success(res, "Sign-in successful", data);
  } catch (error) {
    ApiResponse.internal(res, "something went wrong while signing in user");
  }
};

export { signin, signup };
