import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { handleApiError, handleUserResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('__session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const controller = container.resolve(UserController);
    const verifyResult = await controller.verifySession(sessionToken);

    if (verifyResult.isFailure) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uid } = verifyResult.getValue();
    const result = await controller.logoutAllDevices(uid);

    if (result.isFailure) {
        return handleUserResult(result);
    }

    const response = NextResponse.json({ 
        status: 'success',
        message: 'All sessions have been invalidated.'
    }, { status: 200 });

    // Clear the current session cookie as well
    response.cookies.delete('__session');

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
