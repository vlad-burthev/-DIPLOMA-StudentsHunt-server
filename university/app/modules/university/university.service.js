import client from "../../../db.config.js";
import { configDotenv } from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

configDotenv();

export class UniversityService {
  static async login(email, password) {
    try {
      await client.connect();

      const { rows } = await client.query(
        `SELECT * FROM universities WHERE email = $1`,
        [email]
      );

      const university = rows[0];
      if (!university) {
        throw new Error("University not found");
      }

      const isValidPassword = await bcrypt.compare(
        password,
        university.password
      );
      if (!isValidPassword) {
        throw new Error("Invalid password");
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: university.id,
          email: university.email,
          role_id: university.role_id,
          entity_type: "UNIVERSITY",
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "24h" }
      );

      return {
        token,
        university: {
          id: university.id,
          email: university.email,
          name: university.name,
        },
      };
    } finally {
      await client.end();
    }
  }

  static async register(universityData) {
    try {
      await client.connect();
      await client.query("BEGIN");

      // Hash password
      const hashedPassword = await bcrypt.hash(universityData.password, 10);

      // Insert university
      const {
        rows: [university],
      } = await client.query(
        `INSERT INTO universities (email, password, name, role_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, name, role_id`,
        [
          universityData.email,
          hashedPassword,
          universityData.name,
          universityData.role_id,
        ]
      );

      await client.query("COMMIT");
      return university;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      await client.end();
    }
  }

  static async getUniversityById(id) {
    try {
      await client.connect();

      const { rows } = await client.query(
        `SELECT u.*, r.name as role_name
         FROM universities u
         JOIN roles r ON u.role_id = r.id
         WHERE u.id = $1 AND u.deleted_at IS NULL`,
        [id]
      );

      if (rows.length === 0) {
        throw new Error("University not found");
      }

      return rows[0];
    } finally {
      await client.end();
    }
  }

  static async updateUniversity(id, updateData) {
    try {
      await client.connect();
      await client.query("BEGIN");

      const { rows } = await client.query(
        `UPDATE universities 
         SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3 AND deleted_at IS NULL
         RETURNING id, name, email, role_id`,
        [updateData.name, updateData.email, id]
      );

      if (rows.length === 0) {
        throw new Error("University not found");
      }

      await client.query("COMMIT");
      return rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      await client.end();
    }
  }

  static async deleteUniversity(id) {
    try {
      await client.connect();

      const { rows } = await client.query(
        `UPDATE universities 
         SET deleted_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING id`,
        [id]
      );

      if (rows.length === 0) {
        throw new Error("University not found");
      }

      return rows[0];
    } finally {
      await client.end();
    }
  }

  static async getUniversities({ page, limit, search }) {
    try {
      await client.connect();
      const offset = (page - 1) * limit;

      let query = `
        SELECT u.*, r.name as role_name
        FROM universities u
        JOIN roles r ON u.role_id = r.id
        WHERE u.deleted_at IS NULL
      `;
      const params = [];
      let paramCount = 1;

      if (search) {
        query += ` AND (
          u.name ILIKE $${paramCount} OR
          u.email ILIKE $${paramCount} OR
          r.name ILIKE $${paramCount}
        )`;
        params.push(`%${search}%`);
        paramCount++;
      }

      query += ` ORDER BY u.created_at DESC LIMIT $${paramCount} OFFSET $${
        paramCount + 1
      }`;
      params.push(limit, offset);

      const { rows } = await client.query(query, params);

      // Get total count
      const {
        rows: [{ count }],
      } = await client.query(
        `SELECT COUNT(*) 
         FROM universities u
         JOIN roles r ON u.role_id = r.id
         WHERE u.deleted_at IS NULL`
      );

      return {
        universities: rows,
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

  static async updateUniversityStatus(id, status) {
    try {
      await client.connect();

      const { rows } = await client.query(
        `UPDATE universities 
         SET is_active = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND deleted_at IS NULL
         RETURNING id`,
        [status, id]
      );

      if (rows.length === 0) {
        throw new Error("University not found");
      }

      return rows[0];
    } finally {
      await client.end();
    }
  }

  static async getUniversityStudents(id, { page, limit, search }) {
    try {
      await client.connect();
      const offset = (page - 1) * limit;

      let query = `
        SELECT s.*, u.name as university_name
        FROM students s
        JOIN universities u ON s.university_id = u.id
        WHERE s.university_id = $1 AND s.deleted_at IS NULL
      `;
      const params = [id];
      let paramCount = 2;

      if (search) {
        query += ` AND (
          s.name ILIKE $${paramCount} OR
          s.email ILIKE $${paramCount} OR
          s.specialization ILIKE $${paramCount}
        )`;
        params.push(`%${search}%`);
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
         JOIN universities u ON s.university_id = u.id
         WHERE s.university_id = $1 AND s.deleted_at IS NULL`,
        [id]
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

  static async getUniversityStatistics(id) {
    try {
      await client.connect();

      const [
        {
          rows: [studentStats],
        },
        {
          rows: [applicationStats],
        },
        {
          rows: [placementStats],
        },
      ] = await Promise.all([
        client.query(
          `
          SELECT 
            COUNT(*) as total_students,
            COUNT(*) FILTER (WHERE is_active = true) as active_students,
            COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted_students
          FROM students
          WHERE university_id = $1
        `,
          [id]
        ),
        client.query(
          `
          SELECT 
            COUNT(*) as total_applications,
            COUNT(*) FILTER (WHERE status = 'pending') as pending_applications,
            COUNT(*) FILTER (WHERE status = 'accepted') as accepted_applications,
            COUNT(*) FILTER (WHERE status = 'rejected') as rejected_applications
          FROM applications a
          JOIN students s ON a.student_id = s.id
          WHERE s.university_id = $1
        `,
          [id]
        ),
        client.query(
          `
          SELECT 
            COUNT(*) FILTER (WHERE status = 'placed') as placed_students,
            COUNT(*) FILTER (WHERE status = 'interviewing') as interviewing_students,
            COUNT(*) FILTER (WHERE status = 'rejected') as rejected_students
          FROM applications a
          JOIN students s ON a.student_id = s.id
          WHERE s.university_id = $1
        `,
          [id]
        ),
      ]);

      return {
        students: studentStats,
        applications: applicationStats,
        placements: placementStats,
      };
    } finally {
      await client.end();
    }
  }
}
