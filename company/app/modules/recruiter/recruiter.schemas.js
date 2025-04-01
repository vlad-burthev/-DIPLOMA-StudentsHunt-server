import Joi from "joi";

export const recruiterSchemas = {
  createRecruiterSchema: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(8).required().messages({
      "string.min": "Password must be at least 8 characters long",
      "any.required": "Password is required",
    }),
    name: Joi.string().required().messages({
      "any.required": "Name is required",
    }),
    surname: Joi.string().required().messages({
      "any.required": "Surname is required",
    }),
  }),

  getRecruiterSchema: Joi.object({
    id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid recruiter ID format",
      "any.required": "Recruiter ID is required",
    }),
  }),

  updateRecruiterSchema: Joi.object({
    id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid recruiter ID format",
      "any.required": "Recruiter ID is required",
    }),
    email: Joi.string().email().optional().messages({
      "string.email": "Invalid email format",
    }),
    name: Joi.string().optional(),
    surname: Joi.string().optional(),
  }),

  deleteRecruiterSchema: Joi.object({
    id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid recruiter ID format",
      "any.required": "Recruiter ID is required",
    }),
  }),

  getCompanyRecruitersSchema: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
  }),

  acceptInvitationSchema: Joi.object({
    token: Joi.string().required().messages({
      "any.required": "Invitation token is required",
    }),
  }),

  loginSchema: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters long",
      "any.required": "Password is required",
    }),
  }),

  vacancySchema: Joi.object({
    title: Joi.string().min(3).max(50).required().messages({
      "string.min": "Title must be at least 3 characters long",
      "string.max": "Title must not exceed 50 characters",
      "any.required": "Title is required",
    }),
    description: Joi.string().min(50).required().messages({
      "string.min": "Description must be at least 50 characters long",
      "any.required": "Description is required",
    }),
    requirements: Joi.array().items(Joi.string()).min(1).required().messages({
      "array.min": "At least one requirement is required",
      "any.required": "Requirements are required",
    }),
    salary_from: Joi.number().integer().min(0).required().messages({
      "number.base": "Salary from must be a number",
      "number.integer": "Salary from must be an integer",
      "number.min": "Salary from must be greater than or equal to 0",
      "any.required": "Salary from is required",
    }),
    salary_to: Joi.number()
      .integer()
      .min(Joi.ref("salary_from"))
      .required()
      .messages({
        "number.base": "Salary to must be a number",
        "number.integer": "Salary to must be an integer",
        "number.min": "Salary to must be greater than or equal to salary from",
        "any.required": "Salary to is required",
      }),
    currency: Joi.string().valid("USD", "EUR", "UAH").required().messages({
      "any.only": "Currency must be USD, EUR, or UAH",
      "any.required": "Currency is required",
    }),
    location: Joi.string().min(2).max(100).required().messages({
      "string.min": "Location must be at least 2 characters long",
      "string.max": "Location must not exceed 100 characters",
      "any.required": "Location is required",
    }),
    work_type: Joi.number().integer().required().messages({
      "number.base": "Work type must be a number",
      "number.integer": "Work type must be an integer",
      "any.required": "Work type is required",
    }),
    is_activated: Joi.boolean().default(true),
  }),

  applicationStatusSchema: Joi.object({
    status: Joi.string()
      .valid("pending", "accepted", "rejected")
      .required()
      .messages({
        "any.only": "Status must be pending, accepted, or rejected",
        "any.required": "Status is required",
      }),
  }),
};
