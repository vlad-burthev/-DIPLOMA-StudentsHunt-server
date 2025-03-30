import { ApiError, ApiResponse } from "./httpResponse.js";

export const errorHandler = (err, req, res, next) => {
  console.error("Ошибка обработана:", err); // Логирование

  if (err.status && err.code) {
    // Проверяем, есть ли статус и код
    return res.status(err.status).json({
      message: err.message,
      status: err.status,
      code: err.code,
    });
  }

  return res.status(500).json({
    message: err.message || "Внутрішня помилка сервера",
    status: 500,
    code: "INTERNAL_ERROR",
  });
};

export const responseHandler = (req, res, next) => {
  if (res.locals.apiResponse instanceof ApiResponse) {
    const { status, code, data } = res.locals.apiResponse;
    return res.status(status).json({ status, code, data });
  }
  next();
};
