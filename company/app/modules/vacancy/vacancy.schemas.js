import Joi from "joi";

export const vacancySchemas = {
  createVacancySchema: Joi.object({
    title: Joi.string().required().messages({
      "any.required": "Title is required",
    }),
    description: Joi.string().required().messages({
      "any.required": "Description is required",
    }),
    requirements: Joi.array().items(Joi.string()).required().messages({
      "any.required": "Requirements are required",
      "array.base": "Requirements must be an array",
    }),
    responsibilities: Joi.array().items(Joi.string()).required().messages({
      "any.required": "Responsibilities are required",
      "array.base": "Responsibilities must be an array",
    }),
    salary: Joi.object({
      min: Joi.number().min(0).required().messages({
        "number.base": "Minimum salary must be a number",
        "number.min": "Minimum salary cannot be negative",
        "any.required": "Minimum salary is required",
      }),
      max: Joi.number().min(0).required().messages({
        "number.base": "Maximum salary must be a number",
        "number.min": "Maximum salary cannot be negative",
        "any.required": "Maximum salary is required",
      }),
      currency: Joi.string().valid("USD", "EUR", "UAH").required().messages({
        "any.only": "Invalid currency",
        "any.required": "Currency is required",
      }),
    })
      .required()
      .messages({
        "any.required": "Salary information is required",
      }),
    workType: Joi.string()
      .valid("full-time", "part-time", "contract", "internship")
      .required()
      .messages({
        "any.only": "Invalid work type",
        "any.required": "Work type is required",
      }),
    location: Joi.string().required().messages({
      "any.required": "Location is required",
    }),
    isActive: Joi.boolean().default(true),
  }),

  getVacancySchema: Joi.object({
    id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid vacancy ID format",
      "any.required": "Vacancy ID is required",
    }),
  }),

  updateVacancySchema: Joi.object({
    id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid vacancy ID format",
      "any.required": "Vacancy ID is required",
    }),
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    requirements: Joi.array().items(Joi.string()).optional(),
    responsibilities: Joi.array().items(Joi.string()).optional(),
    salary: Joi.object({
      min: Joi.number().min(0).optional(),
      max: Joi.number().min(0).optional(),
      currency: Joi.string().valid("USD", "EUR", "UAH").optional(),
    }).optional(),
    workType: Joi.string()
      .valid("full-time", "part-time", "contract", "internship")
      .optional(),
    location: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
  }),

  deleteVacancySchema: Joi.object({
    id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid vacancy ID format",
      "any.required": "Vacancy ID is required",
    }),
  }),

  getCompanyVacanciesSchema: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    status: Joi.string().valid("active", "inactive").optional(),
  }),

  getRecruiterVacanciesSchema: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    status: Joi.string().valid("active", "inactive").optional(),
  }),

  updateVacancyStatusSchema: Joi.object({
    id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid vacancy ID format",
      "any.required": "Vacancy ID is required",
    }),
    isActive: Joi.boolean().required().messages({
      "any.required": "Status is required",
    }),
  }),

  getVacancyStatisticsSchema: Joi.object({
    id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid vacancy ID format",
      "any.required": "Vacancy ID is required",
    }),
  }),
};
