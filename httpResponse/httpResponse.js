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
  static Response(res, status, data) {
    return res.status(status).json(data);
  }

  static OK(res, data = null) {
    return ApiResponse.Response(res, 200, data);
  }

  static CREATED(res, data = null) {
    return ApiResponse.Response(res, 201, data);
  }

  static NO_CONTENT(res) {
    return ApiResponse.Response(res, 204, data);
  }
}
