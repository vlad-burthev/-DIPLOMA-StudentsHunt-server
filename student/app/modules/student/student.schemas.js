import Joi from "joi";

export const studentSchemas = {
  registerSchema: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters long",
      "any.required": "Password is required",
    }),
    name: Joi.string().required().messages({
      "any.required": "Name is required",
    }),
    surname: Joi.string().required().messages({
      "any.required": "Surname is required",
    }),
    birth_date: Joi.date().iso().required().messages({
      "date.base": "Invalid date format",
      "date.format": "Date must be in ISO format",
      "any.required": "Birth date is required",
    }),
    gender: Joi.string().valid("male", "female", "other").required().messages({
      "any.only": "Gender must be either 'male', 'female', or 'other'",
      "any.required": "Gender is required",
    }),
    phone: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required()
      .messages({
        "string.pattern.base": "Invalid phone number format",
        "any.required": "Phone number is required",
      }),
    city: Joi.string().required().messages({
      "any.required": "City is required",
    }),
    country: Joi.string().required().messages({
      "any.required": "Country is required",
    }),
    education: Joi.string().required().messages({
      "any.required": "Education level is required",
    }),
    institution: Joi.string().required().messages({
      "any.required": "Institution name is required",
    }),
    specialization: Joi.string().required().messages({
      "any.required": "Specialization is required",
    }),
    graduation_year: Joi.number()
      .integer()
      .min(1900)
      .max(new Date().getFullYear())
      .required()
      .messages({
        "number.base": "Graduation year must be a number",
        "number.integer": "Graduation year must be an integer",
        "number.min": "Invalid graduation year",
        "number.max": "Invalid graduation year",
        "any.required": "Graduation year is required",
      }),
    skills: Joi.array().items(Joi.string()).optional(),
  }),

  loginSchema: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  }),

  updateProfileSchema: Joi.object({
    personal: Joi.object({
      name: Joi.string(),
      surname: Joi.string(),
      birth_date: Joi.date().iso(),
      gender: Joi.string().valid("male", "female", "other"),
      photo: Joi.string().uri(),
    }),
    contact: Joi.object({
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
      city: Joi.string(),
      country: Joi.string(),
    }),
    education: Joi.object({
      education: Joi.string(),
      institution: Joi.string(),
      specialization: Joi.string(),
      graduation_year: Joi.number()
        .integer()
        .min(1900)
        .max(new Date().getFullYear()),
    }),
    skills: Joi.array().items(Joi.string()),
  })
    .min(1)
    .messages({
      "object.min": "At least one field must be provided for update",
    }),

  getApplicationsSchema: Joi.object({
    page: Joi.number().min(1).default(1).messages({
      "number.min": "Page number must be greater than 0",
    }),
    limit: Joi.number().min(1).max(100).default(10).messages({
      "number.min": "Limit must be greater than 0",
      "number.max": "Limit cannot exceed 100",
    }),
    status: Joi.string()
      .valid("pending", "accepted", "rejected")
      .optional()
      .messages({
        "any.only":
          "Status must be either 'pending', 'accepted', or 'rejected'",
      }),
  }),

  applyForVacancySchema: Joi.object({
    cover_letter: Joi.string().max(2000).required().messages({
      "string.max": "Cover letter cannot exceed 2000 characters",
      "any.required": "Cover letter is required",
    }),
  }),
};
