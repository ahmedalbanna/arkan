import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/server-init';
import { handleApiError } from '@/lib/utils/api-utils';

export async function POST(request: Request) {
  try {

    let { idToken } = await request.json();
    if (!idToken) {
      return handleApiError({ message: 'ID token is required.' }, 400);
    }

    let expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    let sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    let options = {
      name: '__session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };

    let response = NextResponse.json({ status: 'success' }, { status: 200 });
    response.cookies.set(options);

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
