
'use server';

import { createApiResponse, handleApiError } from '@/lib/utils/api-utils';
import { adminAuth } from '@/lib/firebase/server-init';
import { z } from 'zod';

const signupSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    name: z.string().min(1, "Name is required"),
});

/**
 * API endpoint for creating a new user in Firebase Authentication.
 * This endpoint NO LONGER creates a Firestore user profile. That logic
 * has been moved to a separate user profile endpoint to ensure a single
 * source of truth for profile creation.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = signupSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }
        
        const { email, password, name } = validation.data;

        // Only create the auth user here.
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: name
        });
        
        // Return only the basic user record. The client will handle creating the profile.
        return createApiResponse({ user: { uid: userRecord.uid, email: userRecord.email } }, 201);

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
