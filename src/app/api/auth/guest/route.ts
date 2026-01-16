import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/utils/api-utils';

export async function POST(request: Request) {
  try {
    const expiresIn = 60 * 60 * 24 * 30 * 1000; // 30 days for guest session

    const options = {
      name: '__guest',
      value: 'true',
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
