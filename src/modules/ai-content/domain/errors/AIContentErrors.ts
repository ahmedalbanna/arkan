export enum AIContentErrorType {
  NOT_FOUND = "NOT_FOUND",
  SAVE_ERROR = "SAVE_ERROR",
  DELETE_ERROR = "DELETE_ERROR",
  VALIDATION = "VALIDATION",
  INTERNAL = "INTERNAL",
  UNAUTHORIZED = "UNAUTHORIZED"
}

export class AIContentError {
  constructor(
    public readonly type: AIContentErrorType,
    public readonly message: string,
    public readonly details?: any
  ) {}

  public static notFound(message: string = "Content not found"): AIContentError {
    return new AIContentError(AIContentErrorType.NOT_FOUND, message);
  }

  public static saveError(message: string = "Failed to save content", details?: any): AIContentError {
    return new AIContentError(AIContentErrorType.SAVE_ERROR, message, details);
  }

  public static deleteError(message: string = "Failed to delete content", details?: any): AIContentError {
    return new AIContentError(AIContentErrorType.DELETE_ERROR, message, details);
  }

  public static validation(message: string, details?: any): AIContentError {
    return new AIContentError(AIContentErrorType.VALIDATION, message, details);
  }

  public static internal(message: string = "Internal server error"): AIContentError {
    return new AIContentError(AIContentErrorType.INTERNAL, message);
  }

  public static unauthorized(message: string = "Unauthorized"): AIContentError {
    return new AIContentError(AIContentErrorType.UNAUTHORIZED, message);
  }
}
