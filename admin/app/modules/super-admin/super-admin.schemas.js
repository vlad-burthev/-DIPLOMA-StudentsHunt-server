import Joi from "joi";

export const superAdminSchemas = {
  loginSchema: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().min(6).messages({
      "string.min": "Password must be at least 6 characters long",
      "any.required": "Password is required",
    }),
  }),

  createAdminSchema: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().min(6).messages({
      "string.min": "Password must be at least 6 characters long",
      "any.required": "Password is required",
    }),
    name: Joi.string().required().min(2).max(50).messages({
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name must not exceed 50 characters",
      "any.required": "Name is required",
    }),
    role_id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid role ID format",
      "any.required": "Role ID is required",
    }),
  }),

  updateAdminStatusSchema: Joi.object({
    status: Joi.boolean().required().messages({
      "boolean.base": "Status must be a boolean value",
      "any.required": "Status is required",
    }),
  }),

  getAdminsSchema: Joi.object({
    page: Joi.number().integer().min(1).messages({
      "number.base": "Page must be a number",
      "number.integer": "Page must be an integer",
      "number.min": "Page must be at least 1",
    }),
    limit: Joi.number().integer().min(1).max(100).messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be an integer",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit must not exceed 100",
    }),
    search: Joi.string().min(2).messages({
      "string.min": "Search term must be at least 2 characters long",
    }),
  }),

  getSystemLogsSchema: Joi.object({
    page: Joi.number().integer().min(1).messages({
      "number.base": "Page must be a number",
      "number.integer": "Page must be an integer",
      "number.min": "Page must be at least 1",
    }),
    limit: Joi.number().integer().min(1).max(100).messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be an integer",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit must not exceed 100",
    }),
    type: Joi.string().valid("info", "warning", "error").messages({
      "any.only": "Log type must be one of: info, warning, error",
    }),
    startDate: Joi.date().iso().messages({
      "date.base": "Start date must be a valid date",
      "date.format": "Start date must be in ISO format",
    }),
    endDate: Joi.date().iso().min(Joi.ref("startDate")).messages({
      "date.base": "End date must be a valid date",
      "date.format": "End date must be in ISO format",
      "date.min": "End date must be after start date",
    }),
  }),

  updateSystemSettingsSchema: Joi.object({
    site_name: Joi.string().min(2).max(100).messages({
      "string.min": "Site name must be at least 2 characters long",
      "string.max": "Site name must not exceed 100 characters",
    }),
    site_description: Joi.string().max(500).messages({
      "string.max": "Site description must not exceed 500 characters",
    }),
    contact_email: Joi.string().email().messages({
      "string.email": "Please enter a valid email address",
    }),
    max_file_size: Joi.number().integer().min(1).max(10).messages({
      "number.base": "Max file size must be a number",
      "number.integer": "Max file size must be an integer",
      "number.min": "Max file size must be at least 1MB",
      "number.max": "Max file size must not exceed 10MB",
    }),
    allowed_file_types: Joi.array().items(Joi.string()).messages({
      "array.base": "Allowed file types must be an array",
    }),
    maintenance_mode: Joi.boolean().messages({
      "boolean.base": "Maintenance mode must be a boolean value",
    }),
  }),
};
