import { createHash } from "crypto";
import z from "zod";
import { generateToken } from "../../utils/jwt.util.mjs";
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
      return res.status(400).json({
        message: "Validation failed",
        errors: JSON.parse(payload.error?.message),
      });
    }

    const userExists = await getUserByEmail(payload.data.email);

    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // ceate a hash of the password before storing it in the database
    payload.data.password = createHash("sha256")
      .update(payload.data.password)
      .digest("hex");

    const userData = await addUserRecord(payload.data);

    if (!userData) {
      return res.status(500).json({ message: "Failed to create user" });
    }

    return res.status(201).json({
      message: "Sign-up successful",
      data: userData,
    });
  } catch (error) {
    console.error("Error during sign-up:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const signin = async (req, res) => {
  try {
    const payload = userLoginSchema.safeParse(req.body);

    if (!payload.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: JSON.parse(payload.error?.message),
      });
    }

    const userData = await getUserByEmail(payload.data.email);

    if (!userData) {
      return res.status(400).json({ message: "User not registered" });
    }

    const hashedPassword = createHash("sha256")
      .update(payload.data.password)
      .digest("hex");

    if (hashedPassword !== userData.password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const refresh_token = generateToken({
      payload: { id: userData.id, email: userData.email },
      expiresIn: "24h",
    });

    const access_token = generateToken({
      payload: { id: userData.id, email: userData.email },
      expiresIn: "15m",
    });

    const rfTokenUpdate = await updateUserRefreshToken({
      email: userData.email,
      token: refresh_token,
    });

    if (!rfTokenUpdate) {
      return res
        .status(500)
        .json({ message: "Sign-in failed. Please try again." });
    }

    return res.status(200).json({
      message: "Sign-in successful",
      data: { ...userData, refresh_token, access_token },
    });
  } catch (error) {}
};

export { signin, signup };
