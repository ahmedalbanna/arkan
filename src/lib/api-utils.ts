
import { NextResponse, type NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { adminAuth } from '@/lib/firebase/server-init';
import { getUserProfile } from '@/lib/db/queries';

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
      if(error.code === 'auth/id-token-expired') {
        return handleApiError({ message: 'Your session has expired. Please log in again.' }, 401);
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

  // Provide more specific default messages for common Firebase auth errors
  let message = error.message || 'An unexpected server error occurred.';
  if (error.code) {
      switch (error.code) {
          case 'auth/id-token-expired':
              message = 'Your session has expired. Please log in again.';
              break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
          case 'auth/invalid-email':
              message = 'Invalid email or password.';
              break;
          case 'auth/email-already-exists':
              message = 'An account with this email address already exists.';
              break;
          case 'auth/weak-password':
              message = 'The password is too weak. It must be at least 6 characters long.';
              break;
      }
  }

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

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
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
