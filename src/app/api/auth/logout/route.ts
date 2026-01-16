import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/utils/api-utils';

export async function POST(req: Request) {
  try {
    // Options to clear the session cookie
    const sessionOptions = {
        name: '__session',
        value: '',
        maxAge: -1,
        path: '/',
    };
    
    // Options to clear the guest cookie
    const guestOptions = {
        name: '__guest',
        value: '',
        maxAge: -1,
        path: '/',
    }

    const response = NextResponse.json({ message: "Logout successful" }, { status: 200 });
    response.cookies.set(sessionOptions);
    response.cookies.set(guestOptions);
    return response;
  } catch (error: any) {
    return handleApiError(error);
  }
}
