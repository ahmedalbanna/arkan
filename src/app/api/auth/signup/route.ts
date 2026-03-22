
'use server';

import { createApiResponse, handleApiError, handleUserResult } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';
import { z } from 'zod';

const signupSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    name: z.string().min(1, "Name is required"),
});

/**
 * API endpoint for creating a new user in Firebase Authentication and Firestore.
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

        return handleUserResult(result);

    } catch (error: any) {
        return handleApiError(error);
    }
}
