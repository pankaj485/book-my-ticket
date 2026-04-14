import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";
configDotenv();

const generateToken = ({ payload, expiresIn }) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET missing");
    }

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: expiresIn,
    });
  } catch (error) {
    return null;
  }
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded && decoded.userId) {
      return decoded.userId;
    }

    return null;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

export { generateToken, verifyToken };
