
import { NextResponse, type NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { getAdminAuth } from '@/lib/firebase/admin';
import { getUserProfile } from './db/queries';

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
  return async (request: NextRequest, { params }: { params: { [key: string]: string } }) => {
    try {
      const adminAuth = await getAdminAuth();
      const authorization = request.headers.get('Authorization');
      if (!authorization?.startsWith('Bearer ')) {
        return handleApiError({ message: 'Unauthorized: Missing token' }, 401);
      }
      const token = authorization.substring(7);
      const decodedToken = await adminAuth.verifyIdToken(token, true);

      if (!decodedToken || !decodedToken.uid) {
        return handleApiError({ message: 'Unauthorized: Invalid token' }, 401);
      }
      
      const user = await getUserProfile(decodedToken.uid);
      if (!user) {
         return handleApiError({ message: 'Forbidden: User profile not found' }, 403);
      }

      if (options.requireAdmin && user.role !== 'admin') {
        return handleApiError({ message: 'Forbidden: Admin access required' }, 403);
      }

      return handler({ request, user, token, params });
    } catch (error: any) {
      if(error.code === 'auth/id-token-expired') {
        return handleApiError({ message: 'Token expired, please log in again.' }, 401);
      }
       if (error.status && error.message) {
         return handleApiError({ message: error.message }, error.status);
       }
      return handleApiError(error);
    }
  };
};

/**
 * Standardized error handler for API routes.
 * @param error - The error object.
 * @param status - The HTTP status code.
 * @returns A NextResponse object with a standardized error format.
 */
export const handleApiError = (error: any, defaultStatus = 500) => {
  console.error("API Route Error:", error);

  if (error instanceof ZodError) {
    return NextResponse.json({ message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 400 });
  }
  
  const status = error.status || defaultStatus;
  const message = error.message || 'An unexpected server error occurred.';
  const errors = error.errors || undefined;
  
  return NextResponse.json({ message, errors }, { status });
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
