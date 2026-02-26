
import { container } from '@/infrastructure/di/container';
import { IUserRepositoryToken } from '@/modules/users/domain/repositories/IUserRepository';
import { IAuthRepositoryToken } from '@/modules/users/domain/repositories/IAuthRepository';
import { CustomFirebaseError, handleFirebaseError } from '@/infrastructure/firebase/error';
import { NextResponse, type NextRequest } from 'next/server';
import { ZodError } from 'zod';


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
      
      const authModule = require("@/modules/users/infrastructure/repositories/FirebaseAuthRepository");
      const userModule = require("@/modules/users/infrastructure/repositories/FirebaseUserRepository");
      const FirebaseAuthRepository = authModule.FirebaseAuthRepository || authModule.default;
      const FirebaseUserRepository = userModule.FirebaseUserRepository || userModule.default;

      let authRepo: any;
      try {
        if (!container.isRegistered(IAuthRepositoryToken)) {
          container.register(IAuthRepositoryToken, { useClass: FirebaseAuthRepository });
        }
        authRepo = container.resolve<any>(IAuthRepositoryToken);
      } catch (error) {
        const { adminAuth } = require("@/infrastructure/firebase/server-init");
        authRepo = {
          verifyToken: async (tokenValue: string) => {
            const decodedToken = await adminAuth.verifyIdToken(tokenValue, true);
            return { uid: decodedToken.uid, email: decodedToken.email };
          },
        };
      }

      const decodedUser = await authRepo.verifyToken(token);

      if (!decodedUser || !decodedUser.uid) {
        return handleApiError({ message: 'Unauthorized: Invalid token' }, 401);
      }

      let userRepo: any;
      try {
        if (!container.isRegistered(IUserRepositoryToken)) {
          container.register(IUserRepositoryToken, { useClass: FirebaseUserRepository });
        }
        userRepo = container.resolve<any>(IUserRepositoryToken);
      } catch (error) {
        const { adminDb } = require("@/infrastructure/firebase/server-init");
        userRepo = {
          getById: async (id: string) => {
            if (!id) return null;
            const userDoc = await adminDb.collection("users").doc(id).get();
            if (!userDoc.exists) return null;
            const data = userDoc.data();
            return { id: userDoc.id, ...data };
          },
        };
      }

      const user = await userRepo.getById(decodedUser.uid);
      
      if (!user) {
        return handleApiError({ message: 'Forbidden: User profile not found' }, 403);
      }

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
