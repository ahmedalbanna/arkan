import { NextResponse } from 'next/server';
import { handleApiError, handleUserResult } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';

export async function POST(request: Request) {
  try {

    let { idToken } = await request.json();
    if (!idToken) {
      return handleApiError({ message: 'ID token is required.' }, 400);
    }

    const controller = container.resolve(UserController);
    let expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    let result = await controller.createSession(idToken, expiresIn);

    if (result.isFailure) {
        return handleUserResult(result);
    }

    const sessionCookie = result.getValue();

    let options = {
      name: '__session',
      value: sessionCookie,
      maxAge: expiresIn / 1000, // maxAge is in seconds
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
