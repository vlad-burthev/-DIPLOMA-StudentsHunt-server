import client from "../../../../db.config.js";
import { configDotenv } from "dotenv";
import { MailService } from "../../../services/mail.service.js";

configDotenv();

export class VacancyService {
  static async createVacancy(companyId, recruiterId, vacancyData) {
    const {
      title,
      description,
      requirements,
      responsibilities,
      salary,
      workType,
      location,
      isActive,
    } = vacancyData;

    // Start transaction
    await client.query("BEGIN");

    try {
      // Insert vacancy
      const {
        rows: [newVacancy],
      } = await client.query(
        `INSERT INTO vacancies (
          company_id, recruiter_id, title, description, requirements,
          responsibilities, salary, work_type, location, is_activated
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          companyId,
          recruiterId,
          title,
          description,
          requirements,
          responsibilities,
          salary,
          workType,
          location,
          isActive,
        ]
      );

      // Commit transaction
      await client.query("COMMIT");

      return newVacancy;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }

  static async getVacancyById(id) {
    const { rows } = await client.query(
      `SELECT v.*, c.title as company_title, r.name as recruiter_name, r.surname as recruiter_surname
       FROM vacancies v
       LEFT JOIN companies c ON v.company_id = c.id
       LEFT JOIN recruiters r ON v.recruiter_id = r.id
       WHERE v.id = $1 AND v.deleted_at IS NULL`,
      [id]
    );

    return rows[0];
  }

  static async updateVacancy(id, updateData) {
    const {
      title,
      description,
      requirements,
      responsibilities,
      salary,
      workType,
      location,
      isActive,
    } = updateData;

    // Start transaction
    await client.query("BEGIN");

    try {
      // Update vacancy
      await client.query(
        `UPDATE vacancies 
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             requirements = COALESCE($3, requirements),
             responsibilities = COALESCE($4, responsibilities),
             salary = COALESCE($5, salary),
             work_type = COALESCE($6, work_type),
             location = COALESCE($7, location),
             is_activated = COALESCE($8, is_activated)
         WHERE id = $9`,
        [
          title,
          description,
          requirements,
          responsibilities,
          salary,
          workType,
          location,
          isActive,
          id,
        ]
      );

      // Commit transaction
      await client.query("COMMIT");

      return this.getVacancyById(id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }

  static async deleteVacancy(id) {
    const { rows } = await client.query(
      `UPDATE vacancies 
       SET deleted_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id]
    );

    return rows[0];
  }

  static async getCompanyVacancies(companyId, { page, limit, status }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT v.*, r.name as recruiter_name, r.surname as recruiter_surname
      FROM vacancies v
      LEFT JOIN recruiters r ON v.recruiter_id = r.id
      WHERE v.company_id = $1 AND v.deleted_at IS NULL
    `;
    const params = [companyId];
    let paramCount = 2;

    if (status) {
      query += ` AND v.is_activated = $${paramCount}`;
      params.push(status === "active");
      paramCount++;
    }

    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const { rows } = await client.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM vacancies 
      WHERE company_id = $1 AND deleted_at IS NULL
    `;
    const countParams = [companyId];
    let countParamCount = 2;

    if (status) {
      countQuery += ` AND is_activated = $${countParamCount}`;
      countParams.push(status === "active");
    }

    const {
      rows: [{ count }],
    } = await client.query(countQuery, countParams);

    return {
      vacancies: rows,
      pagination: {
        total: parseInt(count),
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  static async getRecruiterVacancies(recruiterId, { page, limit, status }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT v.*
      FROM vacancies v
      WHERE v.recruiter_id = $1 AND v.deleted_at IS NULL
    `;
    const params = [recruiterId];
    let paramCount = 2;

    if (status) {
      query += ` AND v.is_activated = $${paramCount}`;
      params.push(status === "active");
      paramCount++;
    }

    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const { rows } = await client.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM vacancies 
      WHERE recruiter_id = $1 AND deleted_at IS NULL
    `;
    const countParams = [recruiterId];
    let countParamCount = 2;

    if (status) {
      countQuery += ` AND is_activated = $${countParamCount}`;
      countParams.push(status === "active");
    }

    const {
      rows: [{ count }],
    } = await client.query(countQuery, countParams);

    return {
      vacancies: rows,
      pagination: {
        total: parseInt(count),
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  static async updateVacancyStatus(id, isActive) {
    const { rows } = await client.query(
      `UPDATE vacancies 
       SET is_activated = $1 
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [isActive, id]
    );

    return rows[0];
  }

  static async getVacancyStatistics(id) {
    const {
      rows: [stats],
    } = await client.query(
      `SELECT 
        COUNT(*) as total_applications,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_applications,
        COUNT(*) FILTER (WHERE status = 'accepted') as accepted_applications,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_applications
       FROM applications
       WHERE vacancy_id = $1 AND deleted_at IS NULL`,
      [id]
    );

    return stats;
  }
}
