
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { NextResponse, type NextRequest } from 'next/server';
import { ZodError } from 'zod';


interface ApiHandlerOptions {
  requireAdmin?: boolean;
}


interface AuthContext {
  request: NextRequest;
  user: any; // NextAuth session user
  token: string;
  params: { [key: string]: string };
}

type ApiHandler = (context: AuthContext) => Promise<NextResponse | Response>;

/**
 * Higher-order function to wrap API route handlers with authentication checks.
 * Uses NextAuth sessions instead of Firebase tokens.
 * @param handler - The API route handler function.
 * @param options - Options to specify authentication requirements (e.g., requireAdmin).
 * @returns A Next.js API route handler.
 */
export const withAuth = (handler: ApiHandler, options: ApiHandlerOptions = {}) => {
  return async (request: NextRequest, { params }: { params: Promise<{ [key: string]: string }> }) => {
    try {
      console.log('[withAuth] API request received:', {
        method: request.method,
        url: request.url,
        requireAdmin: options.requireAdmin
      });

      const resolvedParams = await params;
      console.log('[withAuth] Resolved params:', resolvedParams);
      
      // Get session from NextAuth
      console.log('[withAuth] Getting session from NextAuth...');
      const session = await getSession();
      
      console.log('[withAuth] Session retrieved:', {
        hasSession: !!session,
        hasUserId: !!session?.user?.id,
        userId: session?.user?.id,
        email: session?.user?.email,
        role: session?.user?.role
      });

      if (!session?.user?.id) {
        console.error('[withAuth] Unauthorized: No session found');
        return handleApiError({ message: 'Unauthorized: No session found' }, 401);
      }

      // Fetch full user profile from database
      console.log('[withAuth] Fetching full user profile from database for userId:', session.user.id);
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          credits: true,
          image: true,
        },
      });

      console.log('[withAuth] User profile retrieved:', {
        hasUser: !!user,
        userId: user?.id,
        email: user?.email,
        role: user?.role,
        credits: user?.credits
      });

      if (!user) {
        console.error('[withAuth] Forbidden: User profile not found in database');
        return handleApiError({ message: 'Forbidden: User profile not found' }, 403);
      }

      if (options.requireAdmin && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        console.error('[withAuth] Forbidden: Admin access required, user role is', user.role);
        return handleApiError({ message: 'Forbidden: Admin access required' }, 403);
      }

      console.log('[withAuth] Authorization passed, calling handler');
      const response = await handler({ request, user, token: session.user.id, params: resolvedParams });
      
      console.log('[withAuth] Handler returned response with status:', response.status);
      return response;
    } catch (error: any) {
      console.error('[withAuth] Exception caught in withAuth:', error);
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

  // 2. Handle Prisma errors
  if (error?.code === 'P2002') {
    // Unique constraint violation
    return NextResponse.json({ message: 'Resource already exists' }, { status: 409 });
  }
  if (error?.code === 'P2025') {
    // Record not found
    return NextResponse.json({ message: 'Resource not found' }, { status: 404 });
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
