import { NextResponse } from 'next/server';
import { handleApiError, handleUserResult } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';
import { z } from 'zod';
import { rateLimiter } from '@/lib/utils/security/rate-limiter';
import { headers as nextHeaders } from 'next/headers';

const schema = z.object({
    email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting
    const headersList = await nextHeaders();
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';
    const { allowed, resetAt } = await rateLimiter.check('forgot-password', ip, 3, 60 * 60 * 1000); // 3 attempts per hour

    if (!allowed) {
        return NextResponse.json({ 
            error: "Too many reset requests. Please try again later.",
            resetAt 
        }, { status: 429 });
    }

    const body = await request.json();
    const validation = schema.safeParse(body);
    
    if (!validation.success) {
        return handleApiError(validation.error);
    }

    const { email } = validation.data;
    const controller = container.resolve(UserController);
    
    const result = await controller.sendPasswordReset(email);

    return handleUserResult(result);
  } catch (error) {
    return handleApiError(error);
  }
}
