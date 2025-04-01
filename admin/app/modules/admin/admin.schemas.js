import Joi from "joi";

export const adminSchemas = {
  loginSchema: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters long",
      "any.required": "Password is required",
    }),
  }),

  getCompaniesSchema: Joi.object({
    page: Joi.number().min(1).default(1).messages({
      "number.min": "Page number must be greater than 0",
    }),
    limit: Joi.number().min(1).max(100).default(10).messages({
      "number.min": "Limit must be greater than 0",
      "number.max": "Limit cannot exceed 100",
    }),
    search: Joi.string().allow("").optional(),
    status: Joi.string().valid("active", "inactive").optional().messages({
      "any.only": "Status must be either 'active' or 'inactive'",
    }),
  }),

  getStudentsSchema: Joi.object({
    page: Joi.number().min(1).default(1).messages({
      "number.min": "Page number must be greater than 0",
    }),
    limit: Joi.number().min(1).max(100).default(10).messages({
      "number.min": "Limit must be greater than 0",
      "number.max": "Limit cannot exceed 100",
    }),
    search: Joi.string().allow("").optional(),
    status: Joi.string().valid("active", "inactive").optional().messages({
      "any.only": "Status must be either 'active' or 'inactive'",
    }),
  }),

  updateStatusSchema: Joi.object({
    status: Joi.string().valid("active", "inactive").required().messages({
      "any.only": "Status must be either 'active' or 'inactive'",
      "any.required": "Status is required",
    }),
  }),
};
