import { NextResponse } from 'next/server';
import { handleApiError, handleUserResult } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';
import { z } from 'zod';

const schema = z.object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = schema.safeParse(body);
    
    if (!validation.success) {
        return handleApiError(validation.error);
    }

    const { token, password } = validation.data;
    const controller = container.resolve(UserController);
    
    // We pass isToken = true to indicate this is a token-based reset
    const result = await controller.resetPassword(token, password, true);

    return handleUserResult(result);
  } catch (error) {
    return handleApiError(error);
  }
}
