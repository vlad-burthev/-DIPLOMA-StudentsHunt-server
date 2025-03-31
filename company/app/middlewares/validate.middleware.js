import { ApiError } from "../utils/httpResponse.js";

export const validateRequest = (schema, source = "body") => {
  return (req, res, next) => {
    const data = req[source];
    const { error } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return next(new ApiError(400, "Validation failed", errorMessages));
    }

    next();
  };
};
