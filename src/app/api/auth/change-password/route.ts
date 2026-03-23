import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { handleApiError, handleUserResult } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';
import { z } from 'zod';

const schema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters long"),
});

export async function POST(request: Request) {
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
    
    const body = await request.json();
    const validation = schema.safeParse(body);
    
    if (!validation.success) {
        return handleApiError(validation.error);
    }

    const { currentPassword, newPassword } = validation.data;
    const result = await controller.changePassword(uid, currentPassword, newPassword);

    return handleUserResult(result);
  } catch (error) {
    return handleApiError(error);
  }
}
