export enum ProjectErrorType {
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  UNAUTHORIZED = "UNAUTHORIZED",
  VALIDATION = "VALIDATION",
  SAVE_ERROR = "SAVE_ERROR",
  DELETE_ERROR = "DELETE_ERROR",
  INTERNAL = "INTERNAL"
}

export class ProjectError {
  constructor(
    public readonly type: ProjectErrorType,
    public readonly message: string,
    public readonly details?: any
  ) {}

  public static notFound(message: string = "Project not found"): ProjectError {
    return new ProjectError(ProjectErrorType.NOT_FOUND, message);
  }

  public static conflict(message: string): ProjectError {
    return new ProjectError(ProjectErrorType.CONFLICT, message);
  }

  public static unauthorized(message: string = "Unauthorized access to project"): ProjectError {
    return new ProjectError(ProjectErrorType.UNAUTHORIZED, message);
  }

  public static validation(message: string, details?: any): ProjectError {
    return new ProjectError(ProjectErrorType.VALIDATION, message, details);
  }

  public static saveError(message: string = "Failed to save project", details?: any): ProjectError {
    return new ProjectError(ProjectErrorType.SAVE_ERROR, message, details);
  }

  public static deleteError(message: string = "Failed to delete project", details?: any): ProjectError {
    return new ProjectError(ProjectErrorType.DELETE_ERROR, message, details);
  }

  public static internal(message: string = "Internal server error"): ProjectError {
    return new ProjectError(ProjectErrorType.INTERNAL, message);
  }
}
