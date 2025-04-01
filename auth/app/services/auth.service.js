import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import client from "../../db.config.js";
import bcrypt from "bcrypt";

configDotenv();

export class AuthService {
  static async activateCompany(activationLink) {
    try {
      // Verify the activation link
      const decoded = jwt.verify(activationLink, process.env.JWT_SECRET_KEY);
      const { email } = decoded;

      // Connect to database
      await client.connect();

      // Update company activation status
      const { rows } = await client.query(
        `UPDATE companies 
         SET activated = true 
         WHERE email = $1 AND activated = false
         RETURNING id`,
        [email]
      );

      if (rows.length === 0) {
        throw new Error("Company not found or already activated");
      }

      // Return success response without redirecting
      return {
        success: true,
        message: "Company activated successfully",
        companyId: rows[0].id,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Activation link has expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid activation link");
      }
      throw error;
    } finally {
      // Always close the connection
      await client.end();
    }
  }

  static async login(email, password) {
    try {
      // Connect to database
      await client.connect();

      const { rows } = await client.query(
        `SELECT c.*, ci.*, ei.*
         FROM companies c
         LEFT JOIN companies_info ci ON c.id = ci.company_id
         LEFT JOIN egrpou_info ei ON c.id = ei.company_id
         WHERE c.email = $1 AND c.deleted_at IS NULL`,
        [email]
      );

      const company = rows[0];
      if (!company) {
        throw new Error("Company not found");
      }

      if (!company.activated) {
        throw new Error("Company account is not activated");
      }

      const isValidPassword = await bcrypt.compare(password, company.password);
      if (!isValidPassword) {
        throw new Error("Invalid password");
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: company.id,
          email: company.email,
          role_id: company.role_id,
          entity_type: "COMPANY",
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "24h" }
      );

      return {
        token,
        company: {
          id: company.id,
          email: company.email,
          title: company.title,
          phone: company.phone,
          photo: company.photo,
          description: company.description,
        },
      };
    } finally {
      // Always close the connection
      await client.end();
    }
  }
}
