import Joi from "joi";

export const applicationSchemas = {
  createApplicationSchema: Joi.object({
    body: Joi.object({
      coverLetter: Joi.string().required().min(100).max(2000),
      resumeUrl: Joi.string().uri().required(),
      portfolioUrl: Joi.string().uri().allow(""),
      additionalInfo: Joi.string().max(500).allow(""),
    }),
    params: Joi.object({
      vacancyId: Joi.string().uuid().required(),
    }),
  }),

  getApplicationSchema: Joi.object({
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  }),

  updateApplicationStatusSchema: Joi.object({
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
    body: Joi.object({
      status: Joi.string()
        .valid("pending", "reviewed", "shortlisted", "rejected", "accepted")
        .required(),
      feedback: Joi.string().max(1000).allow(""),
    }),
  }),

  deleteApplicationSchema: Joi.object({
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  }),

  getVacancyApplicationsSchema: Joi.object({
    query: Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(10),
      status: Joi.string()
        .valid("pending", "reviewed", "shortlisted", "rejected", "accepted")
        .allow(""),
      sortBy: Joi.string()
        .valid("createdAt", "updatedAt", "status")
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
    }),
    params: Joi.object({
      vacancyId: Joi.string().uuid().required(),
    }),
  }),

  getStudentApplicationsSchema: Joi.object({
    query: Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(10),
      status: Joi.string()
        .valid("pending", "reviewed", "shortlisted", "rejected", "accepted")
        .allow(""),
      sortBy: Joi.string()
        .valid("createdAt", "updatedAt", "status")
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
    }),
  }),
};
