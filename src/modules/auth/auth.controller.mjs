import z from "zod";
import { createHash } from "crypto";
import { addUserRecord, getUserByEmail } from "./auth.service.mjs";

const userRegistratoinSchema = z.object({
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

const signup = async (req, res) => {
  try {
    const data = userRegistratoinSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: JSON.parse(data.error?.message),
      });
    }

    const userExists = await getUserByEmail(data.data.email);

    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // ceate a hash of the password before storing it in the database
    data.data.password = createHash("sha256")
      .update(data.data.password)
      .digest("hex");

    const userData = await addUserRecord(data.data);

    return res
      .status(201)
      .json({ message: "Sign-up successful", data: userData });
  } catch (error) {
    console.error("Error during sign-up:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { signup };
