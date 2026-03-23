
'use server';

import { NextResponse } from 'next/server';
import { handleApiError, handleUserResult } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';
import { z } from 'zod';

const signupSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    name: z.string().min(1, "Name is required"),
});

/**
 * API endpoint for creating a new user in SQLite.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = signupSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }
        
        const controller = container.resolve(UserController);
        const result = await controller.createUser({
            ...validation.data,
            role: 'user' // Default role for signup
        });

        if (result.isFailure) {
            return handleUserResult(result);
        }

        const user = result.getValue();
        
        // Auto-login after signup
        const loginResult = await controller.login(validation.data.email, validation.data.password);
        
        if (loginResult.isFailure) {
            // User created but login failed (unlikely), just return success
            return NextResponse.json({ status: 'success', user }, { status: 201 });
        }

        const { token } = loginResult.getValue();
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

        const response = NextResponse.json({ 
            status: 'success',
            user
        }, { status: 201 });

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

    } catch (error: any) {
        return handleApiError(error);
    }
}
