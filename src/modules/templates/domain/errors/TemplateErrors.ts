export enum TemplateErrorType {
  NOT_FOUND = "NOT_FOUND",
  VALIDATION = "VALIDATION",
  SAVE_ERROR = "SAVE_ERROR",
  DELETE_ERROR = "DELETE_ERROR",
  INTERNAL = "INTERNAL"
}

export class TemplateError {
  constructor(
    public readonly type: TemplateErrorType,
    public readonly message: string,
    public readonly details?: any
  ) {}

  public static notFound(message: string = "Template not found"): TemplateError {
    return new TemplateError(TemplateErrorType.NOT_FOUND, message);
  }

  public static validation(message: string, details?: any): TemplateError {
    return new TemplateError(TemplateErrorType.VALIDATION, message, details);
  }

  public static saveError(message: string = "Failed to save template", details?: any): TemplateError {
    return new TemplateError(TemplateErrorType.SAVE_ERROR, message, details);
  }

  public static deleteError(message: string = "Failed to delete template", details?: any): TemplateError {
    return new TemplateError(TemplateErrorType.DELETE_ERROR, message, details);
  }

  public static internal(message: string = "Internal server error"): TemplateError {
    return new TemplateError(TemplateErrorType.INTERNAL, message);
  }
}
