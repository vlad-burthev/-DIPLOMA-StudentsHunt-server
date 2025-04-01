import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { configDotenv } from "dotenv";
import ApiError from "../helpers/ApiError.js";

configDotenv();

export class AuthService {
  static async login(user, password, role) {
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role,
        ...(user.company_id && { company_id: user.company_id }),
        ...(user.university_id && { university_id: user.university_id }),
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        photo: user.photo,
        role,
        ...(user.company_id && { company_id: user.company_id }),
        ...(user.university_id && { university_id: user.university_id }),
      },
    };
  }

  static async logout(token) {
    // In a real application, you might want to blacklist the token
    return { message: "Logged out successfully" };
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (error) {
      throw new ApiError(401, "Invalid or expired token");
    }
  }
}
