export class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("2") ? "success" : "fail";
    this.message = message;
    this.data = data;
  }

  toJSON() {
    return {
      status: this.status,
      message: this.message,
      data: this.data,
    };
  }
}
