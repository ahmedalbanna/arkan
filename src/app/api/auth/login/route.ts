import { NextResponse } from 'next/server';
import { handleApiError, handleUserResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';
import { z } from 'zod';
import { rateLimiter } from '@/infrastructure/security/rate-limiter';
import { headers as nextHeaders } from 'next/headers';

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
    fingerprint: z.string().optional(),
    fingerprintData: z.any().optional(),
});

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting
    const headersList = await nextHeaders();
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';
    const { allowed, resetAt } = await rateLimiter.check('login', ip, 5, 15 * 60 * 1000); // 5 attempts per 15 mins

    if (!allowed) {
        return NextResponse.json({ 
            error: "Too many login attempts. Please try again later.",
            resetAt 
        }, { status: 429 });
    }

    const body = await request.json();
    const validation = loginSchema.safeParse(body);
    
    if (!validation.success) {
        return handleApiError(validation.error);
    }

    const { email, password, rememberMe, fingerprint, fingerprintData } = validation.data;
    const controller = container.resolve(UserController);
    
    const result = await controller.login(email, password);

    if (result.isFailure) {
        return handleUserResult(result);
    }

    const loginData = result.getValue();
    const user = loginData.user;

    // --- 2FA Challenge Check ---
    const userProfileResult = await controller.getUser(user.uid);
    const userProfile = userProfileResult.isSuccess ? userProfileResult.getValue() : null;

    if (userProfile && (userProfile as any).isTwoFactorEnabled) {
        return NextResponse.json({ 
            status: 'requires_2fa',
            userId: user.uid
        }, { status: 200 });
    }

    const token = loginData.token;

    // 2. Record Login History
    await controller.recordLogin({
        userId: user.uid,
        ip: ip || undefined,
        userAgent: headersList.get('user-agent') || 'unknown',
        fingerprint: fingerprint || undefined
    });

    // 3. Register Fingerprint if provided
    if (fingerprint && fingerprintData) {
        await controller.registerFingerprint({ userId: user.uid, fingerprint, metadata: fingerprintData });
    }

    // 30 days if remember me, otherwise 5 days
    const expiresIn = rememberMe 
        ? 60 * 60 * 24 * 30 * 1000 
        : 60 * 60 * 24 * 5 * 1000;

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
