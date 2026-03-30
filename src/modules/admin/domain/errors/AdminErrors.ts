
export enum AdminErrorType {
  NOT_FOUND = "NOT_FOUND",
  VALIDATION = "VALIDATION",
  SAVE_ERROR = "SAVE_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  INTERNAL = "INTERNAL"
}

export class AdminError {
  constructor(
    public readonly type: AdminErrorType,
    public readonly message: string,
    public readonly details?: any
  ) {}

  public static notFound(message: string = "Admin resource not found"): AdminError {
    return new AdminError(AdminErrorType.NOT_FOUND, message);
  }

  public static validation(message: string, details?: any): AdminError {
    return new AdminError(AdminErrorType.VALIDATION, message, details);
  }

  public static saveError(message: string = "Failed to save resource", details?: any): AdminError {
    return new AdminError(AdminErrorType.SAVE_ERROR, message, details);
  }

  public static databaseError(message: string = "Database operation failed"): AdminError {
    return new AdminError(AdminErrorType.DATABASE_ERROR, message);
  }

  public static internal(message: string = "Internal server error"): AdminError {
    return new AdminError(AdminErrorType.INTERNAL, message);
  }
}
