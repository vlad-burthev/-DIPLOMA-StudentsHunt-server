import client from "../../../db.config.js";
import { configDotenv } from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

configDotenv();

export class SuperAdminService {
  static async login(email, password) {
    try {
      await client.connect();

      const { rows } = await client.query(
        `SELECT * FROM super_admins WHERE email = $1`,
        [email]
      );

      const admin = rows[0];
      if (!admin) {
        throw new Error("Super admin not found");
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
          entity_type: "SUPER_ADMIN",
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

  static async createAdmin(adminData) {
    try {
      await client.connect();
      await client.query("BEGIN");

      // Hash password
      const hashedPassword = await bcrypt.hash(adminData.password, 10);

      // Insert admin
      const {
        rows: [admin],
      } = await client.query(
        `INSERT INTO admins (email, password, name, role_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, name, role_id`,
        [adminData.email, hashedPassword, adminData.name, adminData.role_id]
      );

      await client.query("COMMIT");
      return admin;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      await client.end();
    }
  }

  static async getAdmins({ page, limit, search }) {
    try {
      await client.connect();
      const offset = (page - 1) * limit;

      let query = `
        SELECT a.*, r.name as role_name
        FROM admins a
        JOIN roles r ON a.role_id = r.id
        WHERE a.deleted_at IS NULL
      `;
      const params = [];
      let paramCount = 1;

      if (search) {
        query += ` AND (
          a.name ILIKE $${paramCount} OR
          a.email ILIKE $${paramCount} OR
          r.name ILIKE $${paramCount}
        )`;
        params.push(`%${search}%`);
        paramCount++;
      }

      query += ` ORDER BY a.created_at DESC LIMIT $${paramCount} OFFSET $${
        paramCount + 1
      }`;
      params.push(limit, offset);

      const { rows } = await client.query(query, params);

      // Get total count
      const {
        rows: [{ count }],
      } = await client.query(
        `SELECT COUNT(*) 
         FROM admins a
         JOIN roles r ON a.role_id = r.id
         WHERE a.deleted_at IS NULL`
      );

      return {
        admins: rows,
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

  static async updateAdminStatus(id, status) {
    try {
      await client.connect();

      const { rows } = await client.query(
        `UPDATE admins 
         SET is_active = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND deleted_at IS NULL
         RETURNING id`,
        [status, id]
      );

      if (rows.length === 0) {
        throw new Error("Admin not found");
      }

      return rows[0];
    } finally {
      await client.end();
    }
  }

  static async deleteAdmin(id) {
    try {
      await client.connect();

      const { rows } = await client.query(
        `UPDATE admins 
         SET deleted_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING id`,
        [id]
      );

      if (rows.length === 0) {
        throw new Error("Admin not found");
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
        {
          rows: [adminStats],
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
        client.query(`
          SELECT 
            COUNT(*) as total_admins,
            COUNT(*) FILTER (WHERE is_active = true) as active_admins,
            COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted_admins
          FROM admins
        `),
      ]);

      return {
        companies: companyStats,
        students: studentStats,
        vacancies: vacancyStats,
        applications: applicationStats,
        admins: adminStats,
      };
    } finally {
      await client.end();
    }
  }

  static async getSystemLogs({ page, limit, type, startDate, endDate }) {
    try {
      await client.connect();
      const offset = (page - 1) * limit;

      let query = `
        SELECT *
        FROM system_logs
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      if (type) {
        query += ` AND type = $${paramCount}`;
        params.push(type);
        paramCount++;
      }

      if (startDate) {
        query += ` AND created_at >= $${paramCount}`;
        params.push(startDate);
        paramCount++;
      }

      if (endDate) {
        query += ` AND created_at <= $${paramCount}`;
        params.push(endDate);
        paramCount++;
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${
        paramCount + 1
      }`;
      params.push(limit, offset);

      const { rows } = await client.query(query, params);

      // Get total count
      const {
        rows: [{ count }],
      } = await client.query(
        `SELECT COUNT(*) 
         FROM system_logs
         WHERE 1=1${type ? ` AND type = $1` : ""}${
          startDate ? ` AND created_at >= $${type ? 2 : 1}` : ""
        }${
          endDate
            ? ` AND created_at <= $${
                type && startDate ? 3 : type || startDate ? 2 : 1
              }`
            : ""
        }`,
        type ? [type, startDate, endDate].filter(Boolean) : []
      );

      return {
        logs: rows,
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

  static async getSystemSettings() {
    try {
      await client.connect();

      const { rows } = await client.query(
        `SELECT * FROM system_settings ORDER BY key`
      );

      return rows.reduce((acc, row) => {
        acc[row.key] = row.value;
        return acc;
      }, {});
    } finally {
      await client.end();
    }
  }

  static async updateSystemSettings(settings) {
    try {
      await client.connect();
      await client.query("BEGIN");

      for (const [key, value] of Object.entries(settings)) {
        await client.query(
          `INSERT INTO system_settings (key, value)
           VALUES ($1, $2)
           ON CONFLICT (key) 
           DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
          [key, value]
        );
      }

      await client.query("COMMIT");
      return this.getSystemSettings();
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      await client.end();
    }
  }
}
