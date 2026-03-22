
import { container } from '@/infrastructure/di/container';
import { IUserRepositoryToken } from '@/modules/users/domain/repositories/IUserRepository';
import { IAuthRepositoryToken } from '@/modules/users/domain/repositories/IAuthRepository';
import { CustomFirebaseError, handleFirebaseError } from '@/infrastructure/firebase/error';
import { NextResponse, type NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { Result } from './result';
import { Telemetry } from './telemetry';
import { UserError, UserErrorType } from '@/modules/users/domain/errors/UserErrors';
import { ProjectError, ProjectErrorType } from '@/modules/projects/domain/errors/ProjectErrors';
import { BillingError, BillingErrorType } from '@/modules/billing/domain/errors/BillingErrors';
import { RagError, RagErrorType } from '@/modules/rag/domain/errors/RagErrors';
import { TemplateError, TemplateErrorType } from '@/modules/templates/domain/errors/TemplateErrors';
import { AIContentError, AIContentErrorType } from '@/modules/ai-content/domain/errors/AIContentErrors';


interface ApiHandlerOptions {
  requireAdmin?: boolean;
}


interface AuthContext {
  request: NextRequest;
  user: any; // Can be more specific, e.g., UserProfile from db/queries
  token: string;
  params: { [key: string]: string };
}

type ApiHandler = (context: AuthContext) => Promise<NextResponse | Response>;

/**
 * Higher-order function to wrap API route handlers with authentication checks.
 * @param handler - The API route handler function.
 * @param options - Options to specify authentication requirements (e.g., requireAdmin).
 * @returns A Next.js API route handler.
 */
export const withAuth = (handler: ApiHandler, options: ApiHandlerOptions = {}) => {
  return async (request: NextRequest, { params }: { params: Promise<{ [key: string]: string }> }) => {
    try {
      const authorization = request.headers.get('Authorization');
      if (!authorization?.startsWith('Bearer ')) {
        return handleApiError({ message: 'Unauthorized: Missing token' }, 401);
      }
      const token = authorization.substring(7);

      const authRepo = container.resolve<any>(IAuthRepositoryToken);
      const authResult = await authRepo.verifyToken(token);

      if (authResult.isFailure) {
        return handleApiError({ message: 'Unauthorized: Invalid token' }, 401);
      }

      const decodedUser = authResult.getValue();

      const userRepo = container.resolve<any>(IUserRepositoryToken);
      const userResult = await userRepo.getById(decodedUser.uid);

      if (userResult.isFailure) {
        return handleApiError({ message: 'Forbidden: User profile not found' }, 403);
      }

      const user = userResult.getValue();

      if (options.requireAdmin && user.role !== 'admin') {
        return handleApiError({ message: 'Forbidden: Admin access required' }, 403);
      }

      const awaitedParams = await params;
      return handler({ request, user, token, params: awaitedParams });
    } catch (error: any) {
      // All errors, including auth errors, are now piped through the central handler
      return handleApiError(error);
    }
  };
};

/**
 * Standardized error handler for API routes.
 * @param error - The error object.
 * @param defaultStatus - The HTTP status code to use if none is found on the error.
 * @returns A NextResponse object with a standardized error format.
 */
export const handleApiError = (error: any, defaultStatus = 500) => {
  console.error("API Route Error:", error);

  // 1. Handle Zod validation errors specifically
  if (error instanceof ZodError) {
    return NextResponse.json({ message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 400 });
  }

  // 2. Attempt to handle as a Firebase error
  const firebaseError = handleFirebaseError(error);
  if (firebaseError instanceof CustomFirebaseError) {
    let status = 400; // Default for many auth errors
    if (firebaseError.code.includes('not-found')) status = 404;
    if (firebaseError.code.includes('permission-denied')) status = 403;
    if (firebaseError.code.includes('already-exists')) status = 409;
    if (firebaseError.code.includes('unauthenticated') || firebaseError.code.includes('token-expired')) status = 401;

    return NextResponse.json({ message: firebaseError.message, code: firebaseError.code }, { status });
  }

  // 3. Handle custom thrown errors (e.g., from our own logic)
  if (error.status && error.message) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  // 4. Fallback for generic/unexpected errors
  const message = error.message || 'An unexpected server error occurred.';
  const status = error.status || defaultStatus;

  return NextResponse.json({ message }, { status });
};


/**
 * Standardized success response handler for API routes.
 * @param data - The data payload to send.
 * @param status - The HTTP status code.
 * @returns A NextResponse object.
 */
export const createApiResponse = (data: any, status: number) => {
  return NextResponse.json(data, { status });
};

/**
 * Standardized handler for Result objects in API routes.
 * @param result - The Result object to handle.
 * @returns A NextResponse object.
 */
export const handleResult = <T>(result: Result<T, UserError>) => {
  if (result.isSuccess) {
    return createApiResponse(result.getValue(), 200);
  }

  const error = result.error!;
  let status = 500;

  switch (error.type) {
    case UserErrorType.NOT_FOUND:
      status = 404;
      break;
    case UserErrorType.CONFLICT:
      status = 409;
      break;
    case UserErrorType.UNAUTHORIZED:
      status = 401;
      break;
    case UserErrorType.VALIDATION:
      status = 400;
      break;
  }

  if (status >= 500) {
    Telemetry.logFailure('GenericResult', error);
  }

  return NextResponse.json({ message: error.message, details: error.details }, { status });
};

/**
 * Standardized handler for Billing Result objects in API routes.
 * @param result - The Result object to handle.
 * @returns A NextResponse object.
 */
export const handleBillingResult = <T>(result: Result<T, BillingError>) => {
  if (result.isSuccess) {
    return createApiResponse(result.getValue(), 200);
  }

  const error = result.error!;
  let status = 500;

  switch (error.type) {
    case BillingErrorType.NOT_FOUND:
      status = 404;
      break;
    case BillingErrorType.CONFLICT:
      status = 409;
      break;
    case BillingErrorType.UNAUTHORIZED:
      status = 401;
      break;
    case BillingErrorType.VALIDATION:
      status = 400;
      break;
    case BillingErrorType.SAVE_ERROR:
      status = 400;
      break;
    case BillingErrorType.UPDATE_ERROR:
      status = 400;
      break;
  }

  if (status >= 500) {
    Telemetry.logFailure('BillingAPI', error);
  }

  return NextResponse.json({ message: error.message, details: error.details }, { status });
};

/**
 * Standardized handler for Template Result objects in API routes.
 * @param result - The Result object to handle.
 * @returns A NextResponse object.
 */
export const handleTemplateResult = <T>(result: Result<T, TemplateError>) => {
  if (result.isSuccess) {
    return createApiResponse(result.getValue(), 200);
  }

  const error = result.error!;
  let status = 500;

  switch (error.type) {
    case TemplateErrorType.NOT_FOUND:
      status = 404;
      break;
    case TemplateErrorType.SAVE_ERROR:
      status = 400;
      break;
    case TemplateErrorType.DELETE_ERROR:
      status = 400;
      break;
  }

  if (status >= 500) {
    Telemetry.logFailure('TemplateAPI', error);
  }

  return NextResponse.json({ message: error.message, details: error.details }, { status });
};

/**
 * Standardized handler for AIContent Result objects in API routes.
 * @param result - The Result object to handle.
 * @returns A NextResponse object.
 */
export const handleAIContentResult = <T>(result: Result<T, AIContentError>) => {
  if (result.isSuccess) {
    return createApiResponse(result.getValue(), 200);
  }

  const error = result.error!;
  let status = 500;

  switch (error.type) {
    case AIContentErrorType.NOT_FOUND:
      status = 404;
      break;
    case AIContentErrorType.SAVE_ERROR:
      status = 400;
      break;
    case AIContentErrorType.DELETE_ERROR:
      status = 400;
      break;
    case AIContentErrorType.VALIDATION:
      status = 400;
      break;
  }

  if (status >= 500) {
    Telemetry.logFailure('AIContentAPI', error);
  }

  return NextResponse.json({ message: error.message, details: error.details }, { status });
};

/**
 * Standardized handler for RAG Result objects in API routes.
 * @param result - The Result object to handle.
 * @returns A NextResponse object.
 */
export const handleRagResult = <T>(result: Result<T, RagError>) => {
  if (result.isSuccess) {
    return createApiResponse(result.getValue(), 200);
  }

  const error = result.error!;
  let status = 500;

  switch (error.type) {
    case RagErrorType.NOT_FOUND:
      status = 404;
      break;
    case RagErrorType.UNAUTHORIZED:
      status = 401;
      break;
    case RagErrorType.INDEXING_FAILED:
      status = 400;
      break;
    case RagErrorType.RETRIEVAL_FAILED:
      status = 400;
      break;
    case RagErrorType.DATABASE_ERROR:
      status = 500;
      break;
    case RagErrorType.VECTOR_STORE_ERROR:
      status = 500;
      break;
  }

  if (status >= 500) {
    Telemetry.logFailure('RagAPI', error);
  }

  return NextResponse.json({ message: error.message, details: error.details }, { status });
};

/**
 * Standardized handler for Project Result objects in API routes.
 * @param result - The Result object to handle.
 * @returns A NextResponse object.
 */
export const handleProjectResult = <T>(result: Result<T, ProjectError>) => {
  if (result.isSuccess) {
    return createApiResponse(result.getValue(), 200);
  }

  const error = result.error!;
  let status = 500;

  switch (error.type) {
    case ProjectErrorType.NOT_FOUND:
      status = 404;
      break;
    case ProjectErrorType.CONFLICT:
      status = 409;
      break;
    case ProjectErrorType.UNAUTHORIZED:
      status = 401;
      break;
    case ProjectErrorType.VALIDATION:
      status = 400;
      break;
    case ProjectErrorType.SAVE_ERROR:
      status = 400;
      break;
    case ProjectErrorType.DELETE_ERROR:
      status = 400;
      break;
  }

  if (status >= 500) {
    Telemetry.logFailure('ProjectAPI', error);
  }

  return NextResponse.json({ message: error.message, details: error.details }, { status });
};

/**
 * Standardized handler for User Result objects in API routes.
 * @param result - The Result object to handle.
 * @returns A NextResponse object.
 */
export const handleUserResult = <T>(result: Result<T, UserError>) => {
  if (result.isSuccess) {
    return createApiResponse(result.getValue(), 200);
  }

  const error = result.error!;
  let status = 500;

  switch (error.type) {
    case UserErrorType.NOT_FOUND:
      status = 404;
      break;
    case UserErrorType.CONFLICT:
      status = 409;
      break;
    case UserErrorType.UNAUTHORIZED:
      status = 401;
      break;
    case UserErrorType.VALIDATION:
      status = 400;
      break;
    case UserErrorType.INTERNAL:
      status = 500;
      break;
  }

  if (status >= 500) {
    Telemetry.logFailure('UserAPI', error);
  }

  return NextResponse.json({ message: error.message, details: error.details }, { status });
};
