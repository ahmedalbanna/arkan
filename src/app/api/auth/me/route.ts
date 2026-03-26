import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';
import { handleApiError } from '@/infrastructure/api/api-utils';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('__session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const controller = container.resolve(UserController);
    const verifyResult = await controller.verifySession(sessionToken);

    if (verifyResult.isFailure) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const { uid } = verifyResult.getValue();
    const userResult = await controller.getUser(uid);

    if (userResult.isFailure) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user: userResult.getValue()
    }, { status: 200 });

  } catch (error) {
    return handleApiError(error);
  }
}
