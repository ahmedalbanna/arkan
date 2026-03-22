export enum RagErrorType {
  NOT_FOUND = "NOT_FOUND",
  INDEXING_FAILED = "INDEXING_FAILED",
  RETRIEVAL_FAILED = "RETRIEVAL_FAILED",
  DATABASE_ERROR = "DATABASE_ERROR",
  VECTOR_STORE_ERROR = "VECTOR_STORE_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  INTERNAL = "INTERNAL"
}

export class RagError {
  constructor(
    public readonly type: RagErrorType,
    public readonly message: string,
    public readonly details?: unknown
  ) {}

  public static notFound(message: string = "Resource not found"): RagError {
    return new RagError(RagErrorType.NOT_FOUND, message);
  }

  public static indexingFailed(message: string = "Document indexing failed", details?: unknown): RagError {
    return new RagError(RagErrorType.INDEXING_FAILED, message, details);
  }

  public static retrievalFailed(message: string = "Context retrieval failed", details?: unknown): RagError {
    return new RagError(RagErrorType.RETRIEVAL_FAILED, message, details);
  }

  public static databaseError(message: string = "Database operation failed", details?: unknown): RagError {
    return new RagError(RagErrorType.DATABASE_ERROR, message, details);
  }

  public static vectorStoreError(message: string = "Vector store operation failed", details?: unknown): RagError {
    return new RagError(RagErrorType.VECTOR_STORE_ERROR, message, details);
  }

  public static unauthorized(message: string = "Unauthorized access"): RagError {
    return new RagError(RagErrorType.UNAUTHORIZED, message);
  }

  public static internal(message: string = "Internal server error"): RagError {
    return new RagError(RagErrorType.INTERNAL, message);
  }
}
