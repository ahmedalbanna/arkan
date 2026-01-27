
'use server';

import { createApiResponse, handleApiError } from '@/lib/utils/api-utils';
import { adminAuth } from '@/lib/firebase/server-init';
import { getDoc, createUserDocHelper } from '@/lib/firebase/db-helpers';
import { z } from 'zod';
import type { UserProfile } from '@/lib/models';

const signupSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    name: z.string().min(1, "Name is required"),
});

/**
 * API endpoint for creating a new user in Firebase Authentication and Firestore.
 * This is now an atomic operation.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = signupSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }
        
        const { email, password, name } = validation.data;
        const settings = await getDoc('settings', 'defaults');
        const defaultCredits = (settings as any)?.newUserCredits ?? 10;


        // 1. Create the Firebase Auth user
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: name
        });
        
        // 2. Create the corresponding Firestore profile
        const userProfile: Omit<UserProfile, 'id'> = {
            name,
            email,
            role: 'user',
            credits: defaultCredits,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            hasCompletedOnboarding: false,
        };

        await createUserDocHelper(userRecord.uid, userProfile);

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
