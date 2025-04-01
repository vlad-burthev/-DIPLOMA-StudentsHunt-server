import { ApiError } from "../utils/httpResponse.js";

export const validateRequest = (schema, source = "body") => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        throw new ApiError(400, errorMessages.join(", "));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
