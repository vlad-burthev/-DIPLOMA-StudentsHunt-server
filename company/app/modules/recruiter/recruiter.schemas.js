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
};
