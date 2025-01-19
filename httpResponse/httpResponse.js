export class ApiError extends Error {
  constructor(status, code, message) {
    super();
    this.status = status;
    this.message = message;
    this.code = code;
  }

  static badRequest(message) {
    return new ApiError(400, "Bad Request", message);
  }

  static internalServerError(message) {
    return new ApiError(500, "Internal Server Error", message);
  }
}

export class ApiResponse {
  constructor(status, code, data) {
    this.status = status;
    this.code = code;
    this.data = data;
  }

  static OK(data = {}) {
    return new ApiResponse(200, "OK", data);
  }

  static Created(data = {}) {
    return new ApiResponse(201, "CREATED", data);
  }
}
