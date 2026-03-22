export enum AiErrorType {
  NOT_FOUND = "NOT_FOUND",
  GENERATION_FAILED = "GENERATION_FAILED",
  VALIDATION_FAILED = "VALIDATION_FAILED",
  UNAUTHORIZED = "UNAUTHORIZED",
  DATABASE_ERROR = "DATABASE_ERROR",
  INTERNAL = "INTERNAL"
}

export class AiError {
  constructor(
    public readonly type: AiErrorType,
    public readonly message: string,
    public readonly details?: any
  ) {}

  public static notFound(message: string = "AI resource not found"): AiError {
    return new AiError(AiErrorType.NOT_FOUND, message);
  }

  public static generationFailed(message: string = "AI generation failed", details?: any): AiError {
    return new AiError(AiErrorType.GENERATION_FAILED, message, details);
  }

  public static validationFailed(message: string, details?: any): AiError {
    return new AiError(AiErrorType.VALIDATION_FAILED, message, details);
  }

  public static unauthorized(message: string = "Unauthorized access"): AiError {
    return new AiError(AiErrorType.UNAUTHORIZED, message);
  }

  public static databaseError(message: string = "Database operation failed", details?: any): AiError {
    return new AiError(AiErrorType.DATABASE_ERROR, message, details);
  }

  public static internal(message: string = "Internal server error"): AiError {
    return new AiError(AiErrorType.INTERNAL, message);
  }
}
