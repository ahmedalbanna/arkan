'use server';

import { createApiResponse, handleApiError } from '@/lib/utils/api-utils';
import { getUserProfile } from '@/lib/db/queries';
import { adminAuth, adminDb, adminRealtimeDb } from '@/lib/firebase/server-init';
import type { UserRole } from '@/lib/models/user';
import { z } from 'zod';

const signupSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    name: z.string().min(1, "Name is required"),
});

const providerSignupSchema = z.object({
    uid: z.string(),
    email: z.string().email().optional().nullable(),
    name: z.string().optional().nullable(),
    phoneNumber: z.string().optional().nullable(),
});

async function getNewUserCredits(): Promise<number> {
    try {
        let settingsDoc = await adminDb.collection('settings').doc('defaults').get();
        if (settingsDoc.exists) {
            return settingsDoc.data()?.newUserCredits || 10;
        }
        return 10;
    } catch (error) {
        console.error("Could not fetch default settings, falling back to 10 credits.", error);
        return 10;
    }
}

async function notifyAdminsOfNewUser(user: { name?: string | null, email?: string | null }) {
    let adminsSnapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
    if (adminsSnapshot.empty) return;

    let rtdb = adminRealtimeDb;
    let notificationPayload = {
        title: "New User Signed Up",
        description: `A new user, ${user.name || user.email}, has joined the platform.`,
        icon: "user-plus",
        isRead: false,
        createdAt: new Date().toISOString(),
        link: '/admin/manage-users'
    };

    let notificationPromises = adminsSnapshot.docs.map(adminDoc => {
        let adminId = adminDoc.id;
        let notificationRef = rtdb.ref(`notifications/${adminId}`).push();
        return notificationRef.set(notificationPayload);
    });

    await Promise.all(notificationPromises);
}

export async function POST(req: Request) {
    try {

        let body = await req.json();
        let defaultCredits = await getNewUserCredits();

        if (body.uid) {
            let validation = providerSignupSchema.safeParse(body);
            if (!validation.success) {
                return handleApiError(validation.error);
            }

            let { uid, email, name, phoneNumber } = validation.data;
            let existingProfile = await getUserProfile(uid);
            if (existingProfile) {
                return createApiResponse({ message: "User profile already exists.", user: existingProfile }, 200);
            }

            let newUserProfile = {
                name: name || `User ${uid.slice(0, 6)}`,
                email: email || '',
                phoneNumber: phoneNumber || '',
                credits: defaultCredits,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                bio: '',
                profilePictureUrl: '',
                role: 'user' as UserRole,
                hasCompletedOnboarding: false,
            };

            await adminDb.collection('users').doc(uid).set(newUserProfile);
            await notifyAdminsOfNewUser(newUserProfile);
            return createApiResponse({ user: { uid, ...newUserProfile } }, 201);
        } else {
            let validation = signupSchema.safeParse(body);
            if (!validation.success) {
                return handleApiError(validation.error);
            }
            let { email, password, name } = validation.data;

            let userRecord = await adminAuth.createUser({ email, password, displayName: name });

            let newUserProfile = {
                name,
                email,
                phoneNumber: '',
                credits: defaultCredits,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                bio: '',
                profilePictureUrl: '',
                role: 'user' as UserRole,
                hasCompletedOnboarding: false,
            };

            await adminDb.collection('users').doc(userRecord.uid).set(newUserProfile);
            await notifyAdminsOfNewUser(newUserProfile);

            return createApiResponse({ user: { uid: userRecord.uid, email: userRecord.email } }, 201);
        }
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
