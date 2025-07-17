
import { NextResponse, type NextRequest } from 'next/server';
import { auth as adminAuth } from '@/lib/firebase/admin';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('__session')?.value;

  if (!sessionCookie) {
    // If no session cookie, redirect to login page for protected routes
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify the session cookie with Firebase Admin SDK
    await adminAuth.verifySessionCookie(sessionCookie, true);

    // If verification is successful, allow the request to proceed
    return NextResponse.next();
  } catch (error) {
    // If verification fails (e.g., cookie is expired or invalid),
    // redirect to login and clear the invalid cookie.
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set({
        name: '__session',
        value: '',
        maxAge: -1,
        path: '/',
    });
    return response;
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - / (homepage)
     * - /login
     * - /signup
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|signup|$).*)',
  ],
};
