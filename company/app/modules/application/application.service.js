import { ApiError } from "../../../../httpResponse/httpResponse.js";
import { MailService } from "../../../../services/mail.service.js";
import client from "../../../db.config.js";
export class ApplicationService {
  async createApplication(vacancyId, studentId, applicationData) {
    try {
      await client.query("BEGIN");

      // Check if vacancy exists and is active
      const vacancyResult = await client.query(
        "SELECT * FROM vacancies WHERE id = $1 AND status = 'active'",
        [vacancyId]
      );

      if (vacancyResult.rows.length === 0) {
        throw new ApiError(404, "Vacancy not found or inactive");
      }

      // Check if student has already applied
      const existingApplication = await client.query(
        "SELECT * FROM applications WHERE vacancy_id = $1 AND student_id = $2",
        [vacancyId, studentId]
      );

      if (existingApplication.rows.length > 0) {
        throw new ApiError(400, "You have already applied for this vacancy");
      }

      // Create application
      const { coverLetter, resumeUrl, portfolioUrl, additionalInfo } =
        applicationData;
      const result = await client.query(
        `INSERT INTO applications (
          vacancy_id,
          student_id,
          cover_letter,
          resume_url,
          portfolio_url,
          additional_info,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        RETURNING *`,
        [
          vacancyId,
          studentId,
          coverLetter,
          resumeUrl,
          portfolioUrl,
          additionalInfo,
        ]
      );

      // Get vacancy and company details for notification
      const {
        rows: [vacancy],
      } = await client.query(
        `SELECT v.*, c.title as company_title, r.email as recruiter_email
         FROM vacancies v
         LEFT JOIN companies c ON v.company_id = c.id
         LEFT JOIN recruiters r ON v.recruiter_id = r.id
         WHERE v.id = $1`,
        [vacancyId]
      );

      // Send notification to recruiter
      await new MailService().sendApplicationNotification(
        vacancy.recruiter_email,
        vacancy.company_title,
        vacancy.title,
        studentId
      );

      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getApplicationById(id) {
    const result = await client.query(
      `SELECT a.*, v.title as vacancy_title, c.name as company_name,
              s.first_name, s.last_name, s.email as student_email
       FROM applications a
       JOIN vacancies v ON a.vacancy_id = v.id
       JOIN companies c ON v.company_id = c.id
       JOIN students s ON a.student_id = s.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, "Application not found");
    }

    return result.rows[0];
  }

  async updateApplicationStatus(id, status, feedback = null) {
    const client = await client.connect();
    try {
      await client.query("BEGIN");

      const result = await client.query(
        `UPDATE applications 
         SET status = $1, feedback = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [status, feedback, id]
      );

      if (result.rows.length === 0) {
        throw new ApiError(404, "Application not found");
      }

      // Get application details for notification
      const {
        rows: [application],
      } = await client.query(
        `SELECT a.*, v.title as vacancy_title, c.title as company_title,
                s.email as student_email, s.name as student_name, s.surname as student_surname
         FROM applications a
         LEFT JOIN vacancies v ON a.vacancy_id = v.id
         LEFT JOIN companies c ON v.company_id = c.id
         LEFT JOIN students s ON a.student_id = s.id
         WHERE a.id = $1`,
        [id]
      );

      // Send notification to student
      await new MailService().sendApplicationStatusUpdate(
        application.student_email,
        application.student_name,
        application.student_surname,
        application.company_title,
        application.vacancy_title,
        status
      );

      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteApplication(id) {
    const result = await client.query(
      "DELETE FROM applications WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, "Application not found");
    }

    return result.rows[0];
  }

  async getVacancyApplications(
    vacancyId,
    { page = 1, limit = 10, status, sortBy = "createdAt", sortOrder = "desc" }
  ) {
    const offset = (page - 1) * limit;
    const params = [vacancyId, limit, offset];
    let query = `
      SELECT a.*, s.first_name, s.last_name, s.email as student_email
      FROM applications a
      JOIN students s ON a.student_id = s.id
      WHERE a.vacancy_id = $1
    `;

    if (status) {
      query += " AND a.status = $" + (params.length + 1);
      params.push(status);
    }

    query += ` ORDER BY a.${sortBy} ${sortOrder} LIMIT $2 OFFSET $3`;

    const [applications, total] = await Promise.all([
      client.query(query, params),
      client.query(
        "SELECT COUNT(*) FROM applications WHERE vacancy_id = $1" +
          (status ? " AND status = $2" : ""),
        status ? [vacancyId, status] : [vacancyId]
      ),
    ]);

    return {
      applications: applications.rows,
      pagination: {
        total: parseInt(total.rows[0].count),
        page,
        limit,
        totalPages: Math.ceil(parseInt(total.rows[0].count) / limit),
      },
    };
  }

  async getStudentApplications(
    studentId,
    { page = 1, limit = 10, status, sortBy = "createdAt", sortOrder = "desc" }
  ) {
    const offset = (page - 1) * limit;
    const params = [studentId, limit, offset];
    let query = `
      SELECT a.*, v.title as vacancy_title, c.name as company_name
      FROM applications a
      JOIN vacancies v ON a.vacancy_id = v.id
      JOIN companies c ON v.company_id = c.id
      WHERE a.student_id = $1
    `;

    if (status) {
      query += " AND a.status = $" + (params.length + 1);
      params.push(status);
    }

    query += ` ORDER BY a.${sortBy} ${sortOrder} LIMIT $2 OFFSET $3`;

    const [applications, total] = await Promise.all([
      client.query(query, params),
      client.query(
        "SELECT COUNT(*) FROM applications WHERE student_id = $1" +
          (status ? " AND status = $2" : ""),
        status ? [studentId, status] : [studentId]
      ),
    ]);

    return {
      applications: applications.rows,
      pagination: {
        total: parseInt(total.rows[0].count),
        page,
        limit,
        totalPages: Math.ceil(parseInt(total.rows[0].count) / limit),
      },
    };
  }

  async checkApplicationExists(studentId, vacancyId) {
    const result = await client.query(
      `SELECT EXISTS (
        SELECT 1 FROM applications
        WHERE student_id = $1 AND vacancy_id = $2 AND deleted_at IS NULL
      )`,
      [studentId, vacancyId]
    );

    return result.rows[0].exists;
  }
}
