class ApiError<T = any> extends Error {
  status: number;
  errors: T[];

  constructor(status: number, message: string, errors: T[] = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static BadRequest<T = any>(message: string, errors: T[] = []) {
    return new ApiError<T>(400, message, errors);
  }

  static UnauthorizedError<T = any>() {
    return new ApiError<T>(401, "Пользователь не авторизован");
  }
}

export default ApiError;