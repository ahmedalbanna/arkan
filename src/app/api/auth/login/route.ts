import { NextResponse } from 'next/server';
import { handleApiError, handleUserResult } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);
    
    if (!validation.success) {
        return handleApiError(validation.error);
    }

    const { email, password } = validation.data;
    const controller = container.resolve(UserController);
    
    const result = await controller.login(email, password);

    if (result.isFailure) {
        return handleUserResult(result);
    }

    const { token, user } = result.getValue();
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    const response = NextResponse.json({ 
        status: 'success',
        user
    }, { status: 200 });

    response.cookies.set({
      name: '__session',
      value: token,
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
