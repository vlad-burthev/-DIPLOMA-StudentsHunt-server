import { validationResult } from "express-validator";
import ApiError from "../helpers/ApiError.js";

export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      const { error } = await schema.validateAsync(req.body);
      if (error) {
        throw new ApiError(400, error.details[0].message);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
