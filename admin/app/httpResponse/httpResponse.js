export class ApiError extends Error {
  constructor(status = 500, code = "INTERNAL_SERVER_ERROR", { message }) {
    super(message);
    this.status = status;
    this.code = code;
    this.data = { message };
  }

  static BAD_REQUEST(message) {
    return new ApiError(400, "BAD_REQUEST", { message });
  }

  static INTERNAL_SERVER_ERROR(message) {
    return new ApiError(500, "INTERNAL_SERVER_ERROR", { message });
  }

  static UNAUTHORIZED(message) {
    return new ApiError(401, "UNAUTHORIZED", { message });
  }

  static NOT_FOUND(message) {
    return new ApiError(404, "NOT_FOUND", { message });
  }
}

export class ApiResponse {
  constructor(status = 200, code = "OK", data = null) {
    this.status = status;
    this.code = code;
    this.data = data;
  }

  static OK(data = null) {
    return new ApiResponse(200, "OK", data);
  }

  static CREATED(data = null) {
    return new ApiResponse(201, "CREATED", data);
  }

  static NO_CONTENT() {
    return new ApiResponse(204, "NO_CONTENT", null);
  }
}
