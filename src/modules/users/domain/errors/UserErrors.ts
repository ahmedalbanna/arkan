export enum UserErrorType {
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  UNAUTHORIZED = "UNAUTHORIZED",
  VALIDATION = "VALIDATION",
  SAVE_ERROR = "SAVE_ERROR",
  INTERNAL = "INTERNAL"
}

export class UserError {
  constructor(
    public readonly type: UserErrorType,
    public readonly message: string,
    public readonly details?: any
  ) {}

  public static notFound(message: string = "User not found"): UserError {
    return new UserError(UserErrorType.NOT_FOUND, message);
  }

  public static conflict(message: string): UserError {
    return new UserError(UserErrorType.CONFLICT, message);
  }

  public static unauthorized(message: string = "Unauthorized"): UserError {
    return new UserError(UserErrorType.UNAUTHORIZED, message);
  }

  public static validation(message: string, details?: any): UserError {
    return new UserError(UserErrorType.VALIDATION, message, details);
  }

  public static saveError(message: string = "Failed to save resource", details?: any): UserError {
    return new UserError(UserErrorType.SAVE_ERROR, message, details);
  }

  public static internal(message: string = "Internal server error"): UserError {
    return new UserError(UserErrorType.INTERNAL, message);
  }
}
