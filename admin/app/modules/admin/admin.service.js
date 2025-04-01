import client from "../../../db.config.js";
import { configDotenv } from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

configDotenv();

export class AdminService {
  static async login(email, password) {
    try {
      await client.connect();

      const { rows } = await client.query(
        `SELECT * FROM admins WHERE email = $1`,
        [email]
      );

      const admin = rows[0];
      if (!admin) {
        throw new Error("Admin not found");
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        throw new Error("Invalid password");
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: admin.id,
          email: admin.email,
          role_id: admin.role_id,
          entity_type: "ADMIN",
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "24h" }
      );

      return {
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        },
      };
    } finally {
      await client.end();
    }
  }

  static async getCompanies({ page, limit, search, status }) {
    try {
      await client.connect();
      const offset = (page - 1) * limit;

      let query = `
        SELECT c.*, ci.*, ei.*
        FROM companies c
        LEFT JOIN companies_info ci ON c.id = ci.company_id
        LEFT JOIN egrpou_info ei ON c.id = ei.company_id
        WHERE c.deleted_at IS NULL
      `;
      const params = [];
      let paramCount = 1;

      if (search) {
        query += ` AND (
          ci.title ILIKE $${paramCount} OR
          ci.description ILIKE $${paramCount} OR
          ei.name ILIKE $${paramCount}
        )`;
        params.push(`%${search}%`);
        paramCount++;
      }

      if (status) {
        query += ` AND c.activated = $${paramCount}`;
        params.push(status === "active");
        paramCount++;
      }

      query += ` ORDER BY c.created_at DESC LIMIT $${paramCount} OFFSET $${
        paramCount + 1
      }`;
      params.push(limit, offset);

      const { rows } = await client.query(query, params);

      // Get total count
      const {
        rows: [{ count }],
      } = await client.query(
        `SELECT COUNT(*) 
         FROM companies c
         LEFT JOIN companies_info ci ON c.id = ci.company_id
         LEFT JOIN egrpou_info ei ON c.id = ei.company_id
         WHERE c.deleted_at IS NULL`
      );

      return {
        companies: rows,
        pagination: {
          total: parseInt(count),
          page,
          limit,
          totalPages: Math.ceil(parseInt(count) / limit),
        },
      };
    } finally {
      await client.end();
    }
  }

  static async getStudents({ page, limit, search, status }) {
    try {
      await client.connect();
      const offset = (page - 1) * limit;

      let query = `
        SELECT s.*, spi.*, sci.*, sei.*
        FROM students s
        LEFT JOIN students_personal_info spi ON s.id = spi.student_id
        LEFT JOIN students_contact_info sci ON s.id = sci.student_id
        LEFT JOIN students_education_info sei ON s.id = sei.student_id
        WHERE s.deleted_at IS NULL
      `;
      const params = [];
      let paramCount = 1;

      if (search) {
        query += ` AND (
          spi.name ILIKE $${paramCount} OR
          spi.surname ILIKE $${paramCount} OR
          sei.education ILIKE $${paramCount}
        )`;
        params.push(`%${search}%`);
        paramCount++;
      }

      if (status) {
        query += ` AND s.is_active = $${paramCount}`;
        params.push(status === "active");
        paramCount++;
      }

      query += ` ORDER BY s.created_at DESC LIMIT $${paramCount} OFFSET $${
        paramCount + 1
      }`;
      params.push(limit, offset);

      const { rows } = await client.query(query, params);

      // Get total count
      const {
        rows: [{ count }],
      } = await client.query(
        `SELECT COUNT(*) 
         FROM students s
         LEFT JOIN students_personal_info spi ON s.id = spi.student_id
         LEFT JOIN students_contact_info sci ON s.id = sci.student_id
         LEFT JOIN students_education_info sei ON s.id = sei.student_id
         WHERE s.deleted_at IS NULL`
      );

      return {
        students: rows,
        pagination: {
          total: parseInt(count),
          page,
          limit,
          totalPages: Math.ceil(parseInt(count) / limit),
        },
      };
    } finally {
      await client.end();
    }
  }

  static async updateCompanyStatus(id, status) {
    try {
      await client.connect();

      const { rows } = await client.query(
        `UPDATE companies 
         SET activated = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND deleted_at IS NULL
         RETURNING id`,
        [status, id]
      );

      if (rows.length === 0) {
        throw new Error("Company not found");
      }

      return rows[0];
    } finally {
      await client.end();
    }
  }

  static async updateStudentStatus(id, status) {
    try {
      await client.connect();

      const { rows } = await client.query(
        `UPDATE students 
         SET is_active = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND deleted_at IS NULL
         RETURNING id`,
        [status, id]
      );

      if (rows.length === 0) {
        throw new Error("Student not found");
      }

      return rows[0];
    } finally {
      await client.end();
    }
  }

  static async getSystemStatistics() {
    try {
      await client.connect();

      const [
        {
          rows: [companyStats],
        },
        {
          rows: [studentStats],
        },
        {
          rows: [vacancyStats],
        },
        {
          rows: [applicationStats],
        },
      ] = await Promise.all([
        client.query(`
          SELECT 
            COUNT(*) as total_companies,
            COUNT(*) FILTER (WHERE activated = true) as active_companies,
            COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted_companies
          FROM companies
        `),
        client.query(`
          SELECT 
            COUNT(*) as total_students,
            COUNT(*) FILTER (WHERE is_active = true) as active_students,
            COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted_students
          FROM students
        `),
        client.query(`
          SELECT 
            COUNT(*) as total_vacancies,
            COUNT(*) FILTER (WHERE is_active = true) as active_vacancies,
            COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted_vacancies
          FROM vacancies
        `),
        client.query(`
          SELECT 
            COUNT(*) as total_applications,
            COUNT(*) FILTER (WHERE status = 'pending') as pending_applications,
            COUNT(*) FILTER (WHERE status = 'accepted') as accepted_applications,
            COUNT(*) FILTER (WHERE status = 'rejected') as rejected_applications
          FROM applications
        `),
      ]);

      return {
        companies: companyStats,
        students: studentStats,
        vacancies: vacancyStats,
        applications: applicationStats,
      };
    } finally {
      await client.end();
    }
  }
}
