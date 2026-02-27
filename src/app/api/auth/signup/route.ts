
'use server';

import { createApiResponse, handleApiError } from '@/lib/utils/api-utils';
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
        const newUser = await controller.createUser({
            ...validation.data,
            role: 'user' // Default role for signup
        });

        return createApiResponse({ user: { uid: newUser.id, email: newUser.email } }, 201);

    } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
            return handleApiError({ message: "Email address is already in use by another account." }, 409);
        } else if (error.code === 'auth/invalid-email') {
            return handleApiError({ message: "The email address is not valid." }, 400);
        } else if (error.code === 'auth/weak-password') {
            return handleApiError({ message: "The password is too weak. It must be at least 6 characters long." }, 400);
        }
        return handleApiError(error);
    }
}
