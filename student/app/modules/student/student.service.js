import client from "../../../db.config.js";
import { configDotenv } from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "../../../services/cloudinary.service.js";

configDotenv();

export class StudentService {
  static async register(studentData) {
    try {
      await client.connect();
      await client.query("BEGIN");

      // Hash password
      const hashedPassword = await bcrypt.hash(studentData.password, 10);

      // Insert student
      const {
        rows: [student],
      } = await client.query(
        `INSERT INTO students (email, password, is_active)
         VALUES ($1, $2, true)
         RETURNING id, email, is_active`,
        [studentData.email, hashedPassword]
      );

      // Insert personal info
      await client.query(
        `INSERT INTO students_personal_info 
         (student_id, name, surname, birth_date, gender, photo)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          student.id,
          studentData.name,
          studentData.surname,
          studentData.birth_date,
          studentData.gender,
          studentData.photo || process.env.DEFAULT_STUDENT_PHOTO,
        ]
      );

      // Insert contact info
      await client.query(
        `INSERT INTO students_contact_info 
         (student_id, phone, city, country)
         VALUES ($1, $2, $3, $4)`,
        [student.id, studentData.phone, studentData.city, studentData.country]
      );

      // Insert education info
      await client.query(
        `INSERT INTO students_education_info 
         (student_id, education, institution, specialization, graduation_year)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          student.id,
          studentData.education,
          studentData.institution,
          studentData.specialization,
          studentData.graduation_year,
        ]
      );

      // Insert skills
      if (studentData.skills && studentData.skills.length > 0) {
        const skillValues = studentData.skills.map((skill) => [
          student.id,
          skill,
        ]);
        await client.query(
          `INSERT INTO students_skills (student_id, skill)
           SELECT * FROM UNNEST($1::uuid[], $2::text[])`,
          [skillValues.map(([id]) => id), skillValues.map(([, skill]) => skill)]
        );
      }

      await client.query("COMMIT");

      // Generate JWT token
      const token = jwt.sign(
        {
          id: student.id,
          email: student.email,
          entity_type: "STUDENT",
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "24h" }
      );

      return {
        token,
        student: {
          id: student.id,
          email: student.email,
          is_active: student.is_active,
        },
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      await client.end();
    }
  }

  static async login(email, password) {
    try {
      await client.connect();

      const { rows } = await client.query(
        `SELECT * FROM students WHERE email = $1`,
        [email]
      );

      const student = rows[0];
      if (!student) {
        throw new Error("Student not found");
      }

      const isValidPassword = await bcrypt.compare(password, student.password);
      if (!isValidPassword) {
        throw new Error("Invalid password");
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: student.id,
          email: student.email,
          entity_type: "STUDENT",
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "24h" }
      );

      return {
        token,
        student: {
          id: student.id,
          email: student.email,
          is_active: student.is_active,
        },
      };
    } finally {
      await client.end();
    }
  }

  static async getProfile(id) {
    try {
      await client.connect();

      const { rows } = await client.query(
        `SELECT s.*, spi.*, sci.*, sei.*, 
         ARRAY_AGG(DISTINCT ss.skill) as skills
         FROM students s
         LEFT JOIN students_personal_info spi ON s.id = spi.student_id
         LEFT JOIN students_contact_info sci ON s.id = sci.student_id
         LEFT JOIN students_education_info sei ON s.id = sei.student_id
         LEFT JOIN students_skills ss ON s.id = ss.student_id
         WHERE s.id = $1 AND s.deleted_at IS NULL
         GROUP BY s.id, spi.id, sci.id, sei.id`,
        [id]
      );

      if (rows.length === 0) {
        throw new Error("Student not found");
      }

      return rows[0];
    } finally {
      await client.end();
    }
  }

  static async updateProfile(id, updateData) {
    try {
      await client.connect();
      await client.query("BEGIN");

      // Update personal info
      if (updateData.personal) {
        await client.query(
          `UPDATE students_personal_info 
           SET name = $1, surname = $2, birth_date = $3, 
               gender = $4, photo = $5, updated_at = CURRENT_TIMESTAMP
           WHERE student_id = $6`,
          [
            updateData.personal.name,
            updateData.personal.surname,
            updateData.personal.birth_date,
            updateData.personal.gender,
            updateData.personal.photo,
            id,
          ]
        );
      }

      // Update contact info
      if (updateData.contact) {
        await client.query(
          `UPDATE students_contact_info 
           SET phone = $1, city = $2, country = $3, 
               updated_at = CURRENT_TIMESTAMP
           WHERE student_id = $4`,
          [
            updateData.contact.phone,
            updateData.contact.city,
            updateData.contact.country,
            id,
          ]
        );
      }

      // Update education info
      if (updateData.education) {
        await client.query(
          `UPDATE students_education_info 
           SET education = $1, institution = $2, 
               specialization = $3, graduation_year = $4,
               updated_at = CURRENT_TIMESTAMP
           WHERE student_id = $5`,
          [
            updateData.education.education,
            updateData.education.institution,
            updateData.education.specialization,
            updateData.education.graduation_year,
            id,
          ]
        );
      }

      // Update skills
      if (updateData.skills) {
        await client.query(
          `DELETE FROM students_skills WHERE student_id = $1`,
          [id]
        );

        if (updateData.skills.length > 0) {
          const skillValues = updateData.skills.map((skill) => [id, skill]);
          await client.query(
            `INSERT INTO students_skills (student_id, skill)
             SELECT * FROM UNNEST($1::uuid[], $2::text[])`,
            [
              skillValues.map(([id]) => id),
              skillValues.map(([, skill]) => skill),
            ]
          );
        }
      }

      await client.query("COMMIT");

      return this.getProfile(id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      await client.end();
    }
  }

  static async uploadPhoto(id, file) {
    try {
      const photoUrl = await uploadToCloudinary(file, "profile");

      await client.connect();
      await client.query(
        `UPDATE students_personal_info 
         SET photo = $1, updated_at = CURRENT_TIMESTAMP
         WHERE student_id = $2`,
        [photoUrl, id]
      );

      return photoUrl;
    } finally {
      await client.end();
    }
  }

  static async getApplications(id, { page, limit, status }) {
    try {
      await client.connect();
      const offset = (page - 1) * limit;

      let query = `
        SELECT a.*, v.title as vacancy_title, 
               c.title as company_title, ci.name as company_name
        FROM applications a
        JOIN vacancies v ON a.vacancy_id = v.id
        JOIN companies c ON v.company_id = c.id
        JOIN companies_info ci ON c.id = ci.company_id
        WHERE a.student_id = $1 AND a.deleted_at IS NULL
      `;
      const params = [id];
      let paramCount = 2;

      if (status) {
        query += ` AND a.status = $${paramCount}`;
        params.push(status);
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
         FROM applications a
         WHERE a.student_id = $1 AND a.deleted_at IS NULL${
           status ? " AND a.status = $2" : ""
         }`,
        status ? [id, status] : [id]
      );

      return {
        applications: rows,
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

  static async applyForVacancy(studentId, vacancyId, { cover_letter }) {
    try {
      await client.connect();
      await client.query("BEGIN");

      // Check if application already exists
      const { rows: existingApplications } = await client.query(
        `SELECT id FROM applications 
         WHERE student_id = $1 AND vacancy_id = $2 AND deleted_at IS NULL`,
        [studentId, vacancyId]
      );

      if (existingApplications.length > 0) {
        throw new Error("You have already applied for this vacancy");
      }

      // Create new application
      const {
        rows: [application],
      } = await client.query(
        `INSERT INTO applications 
         (student_id, vacancy_id, cover_letter, status)
         VALUES ($1, $2, $3, 'pending')
         RETURNING *`,
        [studentId, vacancyId, cover_letter]
      );

      await client.query("COMMIT");
      return application;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      await client.end();
    }
  }

  static async deleteApplication(studentId, applicationId) {
    try {
      await client.connect();

      const { rows } = await client.query(
        `UPDATE applications 
         SET deleted_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND student_id = $2 AND deleted_at IS NULL
         RETURNING id`,
        [applicationId, studentId]
      );

      if (rows.length === 0) {
        throw new Error("Application not found");
      }

      return rows[0];
    } finally {
      await client.end();
    }
  }
}
