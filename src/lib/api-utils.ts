
import { NextResponse, type NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { adminAuth } from '@/lib/firebase/server-init';
import { getUserProfile } from '@/lib/db/queries';
import { handleFirebaseError, CustomFirebaseError } from '@/lib/firebase/error';


interface ApiHandlerOptions {
  requireAdmin?: boolean;
}

interface RouteContext {
    params: { [key: string]: string | string[] | undefined };
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

// --- This part is client-side specific and should not be in api-utils.ts ---
// Moving it to firebase/client-init.ts is a better pattern, but for now we keep it
// as the project structure has it this way. If refactoring client/server utils, this would move.

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

function getFirebaseClientApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

export function getFirebaseClientDb() {
  const app = getFirebaseClientApp();
  return getDatabase(app);
}
