import client from "../../../../db.config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { CloudinaryService } from "../../../services/cloudinary.service.js";
import { MailService } from "../../../services/mail.service.js";

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
}
