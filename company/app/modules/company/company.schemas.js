import Joi from "joi";

export const companySchemas = {
  registerSchema: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(8).required().messages({
      "string.min": "Password must be at least 8 characters long",
      "any.required": "Password is required",
    }),
    title: Joi.string().required().messages({
      "any.required": "Company title is required",
    }),
    phone: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required()
      .messages({
        "string.pattern.base": "Invalid phone number format",
        "any.required": "Phone number is required",
      }),
    description: Joi.string().allow("").optional(),
    egrpou: Joi.string().length(8).required().messages({
      "string.length": "EGRPOU code must be 8 characters long",
      "any.required": "EGRPOU code is required",
    }),
  }),

  getCompanySchema: Joi.object({
    id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid company ID format",
      "any.required": "Company ID is required",
    }),
  }),

  getCompaniesSchema: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    search: Joi.string().allow("").optional(),
    sort: Joi.string()
      .pattern(/^[a-zA-Z0-9_]+(:(asc|desc))?$/)
      .optional()
      .messages({
        "string.pattern.base":
          "Invalid sort format. Use: field:asc or field:desc",
      }),
  }),

  updateCompanySchema: Joi.object({
    id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid company ID format",
      "any.required": "Company ID is required",
    }),
    email: Joi.string().email().optional().messages({
      "string.email": "Invalid email format",
    }),
    title: Joi.string().optional(),
    phone: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .optional()
      .messages({
        "string.pattern.base": "Invalid phone number format",
      }),
    description: Joi.string().allow("").optional(),
  }),

  deleteCompanySchema: Joi.object({
    id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid company ID format",
      "any.required": "Company ID is required",
    }),
  }),

  getCompanyVacanciesSchema: Joi.object({
    id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid company ID format",
      "any.required": "Company ID is required",
    }),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    status: Joi.string().valid("active", "inactive", "draft").optional(),
  }),

  getCompanyRecruitersSchema: Joi.object({
    id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid company ID format",
      "any.required": "Company ID is required",
    }),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
  }),

  updateCompanyStatusSchema: Joi.object({
    id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid company ID format",
      "any.required": "Company ID is required",
    }),
    status: Joi.string()
      .valid("active", "inactive", "blocked")
      .required()
      .messages({
        "any.only": "Invalid status value",
        "any.required": "Status is required",
      }),
  }),

  getCompanyStatisticsSchema: Joi.object({
    id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid company ID format",
      "any.required": "Company ID is required",
    }),
  }),
};
