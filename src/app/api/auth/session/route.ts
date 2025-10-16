
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/server-init';
import { handleApiError } from '@/lib/api-utils';

export async function POST(request: Request) {
  try {

    const { idToken } = await request.json();
    if (!idToken) {
      return handleApiError({ message: 'ID token is required.' }, 400);
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
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
    return handleApiError(error);
  }
}
