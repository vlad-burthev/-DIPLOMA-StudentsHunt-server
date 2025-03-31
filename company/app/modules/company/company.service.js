import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";

import { MailService } from "../../../../services/mail.service.js";
import { checkEGRPOUCode } from "../../../../services/egrpou.service.js";
import client from "../../../db.config.js";
import CloudinaryService from "../../../../services/cloudnary.service.js";

configDotenv();

export class CompanyService {
  static async createCompany(companyData) {
    const { email, password, title, phone, description, egrpou, photo } =
      companyData;

    // Check if company exists
    const existingCompany = await this.checkCompanyExists(email, title, egrpou);
    if (existingCompany) {
      throw new Error(
        "Company with this email, title, or EGRPOU already exists"
      );
    }

    // Validate EGRPOU
    const egrpouInfo = await checkEGRPOUCode(egrpou);
    if (egrpouInfo instanceof Error) {
      throw new Error(egrpouInfo.message);
    }

    // Upload photo to Cloudinary or use default
    let photoUrl =
      process.env.DEFAULT_COMPANY_PHOTO ||
      "https://res.cloudinary.com/your-cloud-name/image/upload/v1/company/default-company.png";
    if (photo) {
      const result = await CloudinaryService.uploadImage(
        photo,
        "company",
        "image"
      );
      photoUrl = result.secure_url;
    }

    // Start transaction
    await client.query("BEGIN");

    try {
      // Generate activation link
      const activationLink = jwt.sign({ email }, process.env.JWT_SECRET_KEY, {
        expiresIn: "1d",
      });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert company
      const {
        rows: [newCompany],
      } = await client.query(
        `INSERT INTO companies (email, password, activationLink)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [email, hashedPassword, activationLink]
      );

      // Insert EGRPOU info
      await client.query(
        `INSERT INTO egrpou_info (
          company_id, egrpou, name, name_short, address, director, kved, inn, inn_date, last_update
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          newCompany.id,
          egrpou,
          egrpouInfo.name,
          egrpouInfo.name_short,
          egrpouInfo.address,
          egrpouInfo.director,
          egrpouInfo.kved,
          egrpouInfo.inn,
          egrpouInfo.inn_date,
          egrpouInfo.last_update,
        ]
      );

      // Insert company info
      await client.query(
        `INSERT INTO companies_info (company_id, phone, title, photo, description)
         VALUES ($1, $2, $3, $4, $5)`,
        [newCompany.id, phone, title, photoUrl, description]
      );

      // Send activation email
      const activationUrl = `${process.env.API_URL}api/company/activate/${activationLink}`;
      await new MailService().sendActivationMail(email, activationUrl);

      // Commit transaction
      await client.query("COMMIT");

      return newCompany;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }

  static async getCompanyById(id) {
    const { rows } = await client.query(
      `SELECT c.*, ci.*, ei.*
       FROM companies c
       LEFT JOIN companies_info ci ON c.id = ci.company_id
       LEFT JOIN egrpou_info ei ON c.id = ei.company_id
       WHERE c.id = $1 AND c.deleted_at IS NULL`,
      [id]
    );

    return rows[0];
  }

  static async updateCompany(id, updateData) {
    const { email, title, phone, description, photo } = updateData;

    // Check if company exists
    const existingCompany = await this.checkCompanyExists(
      email,
      title,
      null,
      id
    );
    if (existingCompany) {
      throw new Error("Company with this email or title already exists");
    }

    // Upload new photo if provided
    let photoUrl = null;
    if (photo) {
      const result = await CloudinaryService.uploadImage(
        photo,
        "company",
        "image"
      );
      photoUrl = result.secure_url;
    }

    // Start transaction
    await client.query("BEGIN");

    try {
      // Update company info
      if (email) {
        await client.query(`UPDATE companies SET email = $1 WHERE id = $2`, [
          email,
          id,
        ]);
      }

      // Update company details
      await client.query(
        `UPDATE companies_info 
         SET phone = COALESCE($1, phone),
             title = COALESCE($2, title),
             photo = COALESCE($3, photo),
             description = COALESCE($4, description)
         WHERE company_id = $5`,
        [phone, title, photoUrl, description, id]
      );

      // Commit transaction
      await client.query("COMMIT");

      return this.getCompanyById(id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }

  static async deleteCompany(id) {
    const { rows } = await client.query(
      `UPDATE companies 
       SET deleted_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id]
    );

    return rows[0];
  }

  static async getCompanies({ page, limit, search, sort }) {
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

    if (sort) {
      query += ` ORDER BY ${sort}`;
    }

    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
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
        pages: Math.ceil(count / limit),
      },
    };
  }

  static async getCompanyVacancies(id, { page, limit, status }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT v.*, r.name as recruiter_name, r.surname as recruiter_surname
      FROM vacancies v
      LEFT JOIN recruiters r ON v.recruiter_id = r.id
      WHERE v.company_id = $1 AND v.deleted_at IS NULL
    `;
    const params = [id];
    let paramCount = 2;

    if (status) {
      query += ` AND v.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const { rows } = await client.query(query, params);

    // Get total count
    const {
      rows: [{ count }],
    } = await client.query(
      `SELECT COUNT(*) 
       FROM vacancies 
       WHERE company_id = $1 AND deleted_at IS NULL`,
      [id]
    );

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

  static async getCompanyRecruiters(id, { page, limit }) {
    const offset = (page - 1) * limit;
    const { rows } = await client.query(
      `SELECT r.*
       FROM recruiters r
       WHERE r.company_id = $1 AND r.deleted_at IS NULL
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    // Get total count
    const {
      rows: [{ count }],
    } = await client.query(
      `SELECT COUNT(*) 
       FROM recruiters 
       WHERE company_id = $1 AND deleted_at IS NULL`,
      [id]
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

  static async updateCompanyStatus(id, status) {
    const { rows } = await client.query(
      `UPDATE companies 
       SET status = $1 
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [status, id]
    );

    return rows[0];
  }

  static async getCompanyStatistics(id) {
    const [
      {
        rows: [vacancyStats],
      },
      {
        rows: [applicationStats],
      },
      {
        rows: [recruiterStats],
      },
    ] = await Promise.all([
      client.query(
        `SELECT 
          COUNT(*) as total_vacancies,
          COUNT(*) FILTER (WHERE is_activated = true) as active_vacancies,
          COUNT(*) FILTER (WHERE is_activated = false) as inactive_vacancies
         FROM vacancies 
         WHERE company_id = $1 AND deleted_at IS NULL`,
        [id]
      ),
      client.query(
        `SELECT 
          COUNT(*) as total_applications,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_applications,
          COUNT(*) FILTER (WHERE status = 'accepted') as accepted_applications,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected_applications
         FROM applications a
         JOIN vacancies v ON a.vacancy_id = v.id
         WHERE v.company_id = $1 AND v.deleted_at IS NULL`,
        [id]
      ),
      client.query(
        `SELECT COUNT(*) as total_recruiters
         FROM recruiters 
         WHERE company_id = $1 AND deleted_at IS NULL`,
        [id]
      ),
    ]);

    return {
      vacancies: vacancyStats,
      applications: applicationStats,
      recruiters: recruiterStats,
    };
  }

  static async checkCompanyExists(email, title, egrpou, excludeId = null) {
    let query = `
      SELECT EXISTS (
        SELECT 1 FROM companies c
        LEFT JOIN companies_info ci ON c.id = ci.company_id
        LEFT JOIN egrpou_info ei ON c.id = ei.company_id
        WHERE c.deleted_at IS NULL
    `;
    const params = [];
    let paramCount = 1;

    if (email) {
      query += ` AND c.email = $${paramCount}`;
      params.push(email);
      paramCount++;
    }

    if (title) {
      query += ` AND ci.title = $${paramCount}`;
      params.push(title);
      paramCount++;
    }

    if (egrpou) {
      query += ` AND ei.egrpou = $${paramCount}`;
      params.push(egrpou);
      paramCount++;
    }

    if (excludeId) {
      query += ` AND c.id != $${paramCount}`;
      params.push(excludeId);
    }

    query += ")";

    const { rows } = await client.query(query, params);
    return rows[0].exists;
  }
}
