import client from "../../../../db.config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { CloudinaryService } from "../../../services/cloudinary.service.js";
import { MailService } from "../../../services/mail.service.js";
import ApiError from "../../../helpers/ApiError";

configDotenv();

export class RecruiterService {
  static async createRecruiter(companyId, recruiterData) {
    const { email, password, name, surname, photo } = recruiterData;

    // Check if recruiter exists
    const existingRecruiter = await this.checkRecruiterExists(email);
    if (existingRecruiter) {
      throw new Error("Recruiter with this email already exists");
    }

    // Upload photo to Cloudinary
    let photoUrl = null;
    if (photo) {
      const result = await CloudinaryService.uploadImage(
        photo,
        "recruiter",
        "image"
      );
      photoUrl = result.secure_url;
    }

    // Start transaction
    await client.query("BEGIN");

    try {
      // Generate invitation token
      const invitationToken = jwt.sign(
        { email, companyId },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "7d" }
      );

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert recruiter
      const {
        rows: [newRecruiter],
      } = await client.query(
        `INSERT INTO recruiters (
          company_id, email, password, name, surname, photo, invitation_token
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          companyId,
          email,
          hashedPassword,
          name,
          surname,
          photoUrl,
          invitationToken,
        ]
      );

      // Send invitation email
      const invitationUrl = `${process.env.FRONTEND_URL}/accept-invitation?token=${invitationToken}`;
      await new MailService().sendRecruiterInvitationMail(
        email,
        companyId,
        invitationToken
      );

      // Commit transaction
      await client.query("COMMIT");

      return newRecruiter;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }

  static async getRecruiterById(id) {
    const { rows } = await client.query(
      `SELECT r.*, c.title as company_title
       FROM recruiters r
       LEFT JOIN companies c ON r.company_id = c.id
       WHERE r.id = $1 AND r.deleted_at IS NULL`,
      [id]
    );

    return rows[0];
  }

  static async updateRecruiter(id, updateData) {
    const { email, name, surname, photo } = updateData;

    // Check if recruiter exists
    const existingRecruiter = await this.checkRecruiterExists(email, id);
    if (existingRecruiter) {
      throw new Error("Recruiter with this email already exists");
    }

    // Upload new photo if provided
    let photoUrl = null;
    if (photo) {
      const result = await CloudinaryService.uploadImage(
        photo,
        "recruiter",
        "image"
      );
      photoUrl = result.secure_url;
    }

    // Start transaction
    await client.query("BEGIN");

    try {
      // Update recruiter info
      if (email) {
        await client.query(`UPDATE recruiters SET email = $1 WHERE id = $2`, [
          email,
          id,
        ]);
      }

      // Update recruiter details
      await client.query(
        `UPDATE recruiters 
         SET name = COALESCE($1, name),
             surname = COALESCE($2, surname),
             photo = COALESCE($3, photo)
         WHERE id = $4`,
        [name, surname, photoUrl, id]
      );

      // Commit transaction
      await client.query("COMMIT");

      return this.getRecruiterById(id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }

  static async deleteRecruiter(id) {
    const { rows } = await client.query(
      `UPDATE recruiters 
       SET deleted_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id]
    );

    return rows[0];
  }

  static async getCompanyRecruiters(companyId, { page, limit }) {
    const offset = (page - 1) * limit;
    const { rows } = await client.query(
      `SELECT r.*
       FROM recruiters r
       WHERE r.company_id = $1 AND r.deleted_at IS NULL
       LIMIT $2 OFFSET $3`,
      [companyId, limit, offset]
    );

    // Get total count
    const {
      rows: [{ count }],
    } = await client.query(
      `SELECT COUNT(*) 
       FROM recruiters 
       WHERE company_id = $1 AND deleted_at IS NULL`,
      [companyId]
    );

    return {
      recruiters: rows,
      pagination: {
        total: parseInt(count),
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  static async acceptInvitation(token) {
    try {
      // Verify invitation token
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const { email, companyId } = decoded;

      // Get recruiter
      const { rows } = await client.query(
        `SELECT * FROM recruiters 
         WHERE email = $1 AND company_id = $2 AND invitation_token = $3`,
        [email, companyId, token]
      );

      if (!rows[0]) {
        throw new Error("Invalid invitation token");
      }

      // Update recruiter status
      await client.query(
        `UPDATE recruiters 
         SET invitation_token = NULL,
             is_activated = true
         WHERE id = $1`,
        [rows[0].id]
      );

      return rows[0];
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Invitation has expired");
      }
      throw error;
    }
  }

  static async checkRecruiterExists(email, excludeId = null) {
    let query = `
      SELECT EXISTS (
        SELECT 1 FROM recruiters
        WHERE email = $1 AND deleted_at IS NULL
    `;
    const params = [email];

    if (excludeId) {
      query += ` AND id != $2`;
      params.push(excludeId);
    }

    query += ")";

    const { rows } = await client.query(query, params);
    return rows[0].exists;
  }

  // Authentication
  async login(email, password) {
    const query = `
      SELECT r.*, c.id as company_id, c.title as company_name 
      FROM recruiters r
      JOIN companies c ON r.company_id = c.id
      WHERE r.email = $1
    `;

    const result = await client.query(query, [email]);
    const recruiter = result.rows[0];

    if (!recruiter) {
      throw new ApiError(401, "Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(password, recruiter.password);
    if (!isValidPassword) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = jwt.sign(
      { id: recruiter.id, email: recruiter.email, role: recruiter.role_id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    return {
      token,
      recruiter: {
        id: recruiter.id,
        email: recruiter.email,
        name: recruiter.name,
        surname: recruiter.surname,
        photo: recruiter.photo,
        company_id: recruiter.company_id,
        company_name: recruiter.company_name,
      },
    };
  }

  async logout(token) {
    // In a real application, you might want to blacklist the token
    return { message: "Logged out successfully" };
  }

  // Vacancy Management
  async createVacancy(recruiterId, vacancyData) {
    const {
      title,
      description,
      requirements,
      salary_from,
      salary_to,
      currency,
      location,
      work_type,
    } = vacancyData;

    const query = `
      INSERT INTO vacancies (
        company_id, recruiter_id, title, description, requirements,
        salary_from, salary_to, currency, location, work_type
      )
      SELECT c.id, $1, $2, $3, $4, $5, $6, $7, $8, $9
      FROM recruiters r
      JOIN companies c ON r.company_id = c.id
      WHERE r.id = $1
      RETURNING *
    `;

    const values = [
      recruiterId,
      title,
      description,
      requirements,
      salary_from,
      salary_to,
      currency,
      location,
      work_type,
    ];
    const result = await client.query(query, values);

    return result.rows[0];
  }

  async updateVacancy(recruiterId, vacancyId, vacancyData) {
    const {
      title,
      description,
      requirements,
      salary_from,
      salary_to,
      currency,
      location,
      work_type,
      is_activated,
    } = vacancyData;

    const query = `
      UPDATE vacancies v
      SET title = COALESCE($1, v.title),
        description = COALESCE($2, v.description),
        requirements = COALESCE($3, v.requirements),
        salary_from = COALESCE($4, v.salary_from),
        salary_to = COALESCE($5, v.salary_to),
        currency = COALESCE($6, v.currency),
        location = COALESCE($7, v.location),
        work_type = COALESCE($8, v.work_type),
        is_activated = COALESCE($9, v.is_activated),
        updated_at = NOW()
      FROM recruiters r
      WHERE v.id = $10 AND v.recruiter_id = r.id AND r.id = $11
      RETURNING v.*
    `;

    const values = [
      title,
      description,
      requirements,
      salary_from,
      salary_to,
      currency,
      location,
      work_type,
      is_activated,
      vacancyId,
      recruiterId,
    ];
    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      throw new ApiError(404, "Vacancy not found");
    }

    return result.rows[0];
  }

  async deleteVacancy(recruiterId, vacancyId) {
    const query = `
      DELETE FROM vacancies v
      USING recruiters r
      WHERE v.id = $1 AND v.recruiter_id = r.id AND r.id = $2
      RETURNING v.id
    `;

    const result = await client.query(query, [vacancyId, recruiterId]);

    if (result.rows.length === 0) {
      throw new ApiError(404, "Vacancy not found");
    }

    return { message: "Vacancy deleted successfully" };
  }

  // Applications Management
  async getApplications(recruiterId, vacancyId = null) {
    let query = `
      SELECT a.*, v.title as vacancy_title, s.name as student_name, s.surname as student_surname
      FROM applications a
      JOIN vacancies v ON a.vacancy_id = v.id
      JOIN students s ON a.student_id = s.id
      JOIN recruiters r ON v.recruiter_id = r.id
      WHERE r.id = $1
    `;

    let values = [recruiterId];

    if (vacancyId) {
      query += " AND v.id = $2";
      values.push(vacancyId);
    }

    query += " ORDER BY a.created_at DESC";

    const result = await client.query(query, values);
    return result.rows;
  }

  async updateApplicationStatus(recruiterId, applicationId, status) {
    const query = `
      UPDATE applications a
      SET status = $1, updated_at = NOW()
      FROM vacancies v
      JOIN recruiters r ON v.recruiter_id = r.id
      WHERE a.id = $2 AND a.vacancy_id = v.id AND r.id = $3
      RETURNING a.*
    `;

    const result = await client.query(query, [
      status,
      applicationId,
      recruiterId,
    ]);

    if (result.rows.length === 0) {
      throw new ApiError(404, "Application not found");
    }

    return result.rows[0];
  }

  // Candidates Management
  async getAllCandidates(recruiterId) {
    const query = `
      SELECT DISTINCT s.*, 
             COUNT(a.id) as total_applications,
             MAX(a.created_at) as last_application_date
      FROM students s
      LEFT JOIN applications a ON s.id = a.student_id
      LEFT JOIN vacancies v ON a.vacancy_id = v.id
      LEFT JOIN recruiters r ON v.recruiter_id = r.id
      WHERE r.id = $1
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `;

    const result = await client.query(query, [recruiterId]);
    return result.rows;
  }

  async getCandidatesWithApplications(recruiterId) {
    const query = `
      SELECT DISTINCT s.*, 
             COUNT(a.id) as total_applications,
             MAX(a.created_at) as last_application_date,
             MAX(a.status) as last_application_status
      FROM students s
      JOIN applications a ON s.id = a.student_id
      JOIN vacancies v ON a.vacancy_id = v.id
      JOIN recruiters r ON v.recruiter_id = r.id
      WHERE r.id = $1
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `;

    const result = await client.query(query, [recruiterId]);
    return result.rows;
  }

  // Statistics
  async getRecruiterStatistics(recruiterId) {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM vacancies WHERE recruiter_id = $1) as total_vacancies,
        (SELECT COUNT(*) FROM vacancies WHERE recruiter_id = $1 AND is_activated = true) as active_vacancies,
        (SELECT COUNT(*) FROM applications WHERE vacancy_id IN (SELECT id FROM vacancies WHERE recruiter_id = $1)) as total_applications,
        (SELECT COUNT(*) FROM applications WHERE vacancy_id IN (SELECT id FROM vacancies WHERE recruiter_id = $1) AND status = 'pending') as pending_applications,
        (SELECT COUNT(*) FROM applications WHERE vacancy_id IN (SELECT id FROM vacancies WHERE recruiter_id = $1) AND status = 'accepted') as accepted_applications,
        (SELECT COUNT(*) FROM applications WHERE vacancy_id IN (SELECT id FROM vacancies WHERE recruiter_id = $1) AND status = 'rejected') as rejected_applications,
        (SELECT COUNT(DISTINCT student_id) FROM applications WHERE vacancy_id IN (SELECT id FROM vacancies WHERE recruiter_id = $1)) as unique_candidates
    `;

    const result = await client.query(query, [recruiterId]);
    return result.rows[0];
  }
}
