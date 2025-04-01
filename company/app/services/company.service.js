const db = require("../config/db.config");
const ApiError = require("../helpers/ApiError");
const { uploadToCloudinary } = require("./cloudinary.service");

class CompanyService {
  // Recruiter Management
  async createRecruiter(companyId, recruiterData) {
    const { email, password, name, surname, photo } = recruiterData;

    // Upload photo to Cloudinary
    const photoUrl = await uploadToCloudinary(photo, "recruiters");

    const query = `
      INSERT INTO recruiters (company_id, email, password, name, surname, photo)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, name, surname, photo, created_at
    `;

    const values = [companyId, email, password, name, surname, photoUrl];
    const result = await db.query(query, values);

    return result.rows[0];
  }

  async updateRecruiter(companyId, recruiterId, recruiterData) {
    const { name, surname, photo } = recruiterData;

    let photoUrl;
    if (photo) {
      photoUrl = await uploadToCloudinary(photo, "recruiters");
    }

    const query = `
      UPDATE recruiters 
      SET name = COALESCE($1, name),
        surname = COALESCE($2, surname),
        photo = COALESCE($3, photo),
        updated_at = NOW()
      WHERE id = $4 AND company_id = $5
      RETURNING id, email, name, surname, photo, updated_at
    `;

    const values = [name, surname, photoUrl, recruiterId, companyId];
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      throw new ApiError(404, "Recruiter not found");
    }

    return result.rows[0];
  }

  async deleteRecruiter(companyId, recruiterId) {
    const query = `
      DELETE FROM recruiters 
      WHERE id = $1 AND company_id = $2
      RETURNING id
    `;

    const result = await db.query(query, [recruiterId, companyId]);

    if (result.rows.length === 0) {
      throw new ApiError(404, "Recruiter not found");
    }

    return { message: "Recruiter deleted successfully" };
  }

  // Company Statistics
  async getCompanyStatistics(companyId) {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM recruiters WHERE company_id = $1) as total_recruiters,
        (SELECT COUNT(*) FROM vacancies WHERE company_id = $1) as total_vacancies,
        (SELECT COUNT(*) FROM vacancies WHERE company_id = $1 AND is_activated = true) as active_vacancies,
        (SELECT COUNT(*) FROM applications WHERE vacancy_id IN (SELECT id FROM vacancies WHERE company_id = $1)) as total_applications
    `;

    const result = await db.query(query, [companyId]);
    return result.rows[0];
  }

  // Company Profile Management
  async updateCompanyProfile(companyId, profileData) {
    const { title, description, phone, photo } = profileData;

    let photoUrl;
    if (photo) {
      photoUrl = await uploadToCloudinary(photo, "companies");
    }

    const query = `
      UPDATE companies_info 
      SET title = COALESCE($1, title),
        description = COALESCE($2, description),
        phone = COALESCE($3, phone),
        photo = COALESCE($4, photo)
      WHERE company_id = $5
      RETURNING *
    `;

    const values = [title, description, phone, photoUrl, companyId];
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      throw new ApiError(404, "Company profile not found");
    }

    return result.rows[0];
  }

  async deleteCompanyProfile(companyId) {
    const query = `
      DELETE FROM companies_info 
      WHERE company_id = $1
      RETURNING id
    `;

    const result = await db.query(query, [companyId]);

    if (result.rows.length === 0) {
      throw new ApiError(404, "Company profile not found");
    }

    return { message: "Company profile deleted successfully" };
  }
}

module.exports = new CompanyService();
