import { NextResponse } from 'next/server';
import { handleApiError, handleUserResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';
import { z } from 'zod';

const schema = z.object({
    userId: z.string(),
    token: z.string().length(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = schema.safeParse(body);
    
    if (!validation.success) {
        return handleApiError(validation.error);
    }

    const { userId, token } = validation.data;
    const controller = container.resolve(UserController);
    
    // 1. Verify TOTP
    const result = await controller.verify2FAToken(userId, token);

    if (result.isFailure || !result.getValue()) {
        return NextResponse.json({ error: "Invalid 2FA code." }, { status: 401 });
    }

    // 2. Fetch User to create session
    const userResult = await controller.getUser(userId);
    if (userResult.isFailure) return handleUserResult(userResult);
    
    const user = userResult.getValue();

    // 3. Create Session (Since verification is successful)
    // We need a temporary token or way to login the user here.
    // For now, let's assume we can generate a session token directly if 2FA passes.
    
    const { DrizzleAuthRepository } = require("@/modules/users/infrastructure/repositories/DrizzleAuthRepository");
    const authRepo = container.resolve(DrizzleAuthRepository);
    
    const { AuthCrypto } = require("@/modules/users/domain/utils/auth-crypto");
    const sessionToken = await AuthCrypto.createToken({ 
        uid: user.id, 
        email: user.email, 
        version: (user as any).tokenVersion 
    });

    const response = NextResponse.json({ 
        status: 'success',
        user
    }, { status: 200 });

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    response.cookies.set({
      name: '__session',
      value: sessionToken,
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
