
import { handleApiErrorEnhanced } from '@/lib/core/api';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const options = {
      name: '__session',
      value: '',
      maxAge: -1, // Expire the cookie immediately
      path: '/',
    };

    const response = NextResponse.json({ message: "Logout successful" }, { status: 200 });
    response.cookies.set(options);
    return response;
  } catch (error: any) {
    return handleApiErrorEnhanced(error);
  }
}
