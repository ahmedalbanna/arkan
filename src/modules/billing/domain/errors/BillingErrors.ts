export enum BillingErrorType {
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  UNAUTHORIZED = "UNAUTHORIZED",
  VALIDATION = "VALIDATION",
  SAVE_ERROR = "SAVE_ERROR",
  UPDATE_ERROR = "UPDATE_ERROR",
  INTERNAL = "INTERNAL"
}

export class BillingError {
  constructor(
    public readonly type: BillingErrorType,
    public readonly message: string,
    public readonly details?: any
  ) {}

  public static notFound(message: string = "Resource not found"): BillingError {
    return new BillingError(BillingErrorType.NOT_FOUND, message);
  }

  public static conflict(message: string): BillingError {
    return new BillingError(BillingErrorType.CONFLICT, message);
  }

  public static unauthorized(message: string = "Unauthorized access"): BillingError {
    return new BillingError(BillingErrorType.UNAUTHORIZED, message);
  }

  public static validation(message: string, details?: any): BillingError {
    return new BillingError(BillingErrorType.VALIDATION, message, details);
  }

  public static saveError(message: string = "Failed to save transaction", details?: any): BillingError {
    return new BillingError(BillingErrorType.SAVE_ERROR, message, details);
  }

  public static updateError(message: string = "Failed to update transaction", details?: any): BillingError {
    return new BillingError(BillingErrorType.UPDATE_ERROR, message, details);
  }

  public static internal(message: string = "Internal server error"): BillingError {
    return new BillingError(BillingErrorType.INTERNAL, message);
  }
}
