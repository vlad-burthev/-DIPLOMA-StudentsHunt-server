import Joi from "joi";

export const universitySchemas = {
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

  registerSchema: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().min(6).messages({
      "string.min": "Password must be at least 6 characters long",
      "any.required": "Password is required",
    }),
    name: Joi.string().required().min(2).max(100).messages({
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name must not exceed 100 characters",
      "any.required": "Name is required",
    }),
    role_id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid role ID format",
      "any.required": "Role ID is required",
    }),
  }),

  updateUniversitySchema: Joi.object({
    name: Joi.string().min(2).max(100).messages({
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name must not exceed 100 characters",
    }),
    email: Joi.string().email().messages({
      "string.email": "Please enter a valid email address",
    }),
  }),

  updateUniversityStatusSchema: Joi.object({
    status: Joi.boolean().required().messages({
      "boolean.base": "Status must be a boolean value",
      "any.required": "Status is required",
    }),
  }),

  getUniversitiesSchema: Joi.object({
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

  getUniversityStudentsSchema: Joi.object({
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
};
