
// src/app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';

// Log in a user and set the session cookie
export async function POST(request: Request) {
  const adminAuth = await getAdminAuth();
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required.' }, { status: 400 });
    }

    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const options = {
      name: '__session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };
    
    const response = NextResponse.json({ status: 'success' }, { status: 200 });
    response.cookies.set(options);
    
    return response;
  } catch (error) {
    console.error('Session login error:', error);
    return NextResponse.json({ error: 'Failed to create session.' }, { status: 401 });
  }
}

// Log out a user by clearing the session cookie
export async function DELETE() {
  const options = {
    name: '__session',
    value: '',
    maxAge: -1, // Expire the cookie immediately
    path: '/',
  };

  const response = NextResponse.json({ status: 'success' }, { status: 200 });
  response.cookies.set(options);

  return response;
}
