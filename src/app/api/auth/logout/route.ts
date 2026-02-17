import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/utils/api-utils';

export async function POST(_req: Request) {
  try {
    let options = {
        name: '__session',
        value: '',
        maxAge: -1, // Expire the cookie immediately
        path: '/',
    };

    let response = NextResponse.json({ message: "Logout successful" }, { status: 200 });
    response.cookies.set(options);
    return response;
  } catch (error: any) {
    return handleApiError(error);
  }
}
