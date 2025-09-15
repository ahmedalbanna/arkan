'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminAuth, adminDb, adminRealtimeDb } from '@/lib/firebase/server-init';
import type { UserRole } from '@/lib/types';
import { getUserProfile } from '@/lib/db/queries';
import { handleApiError, createApiResponse } from '@/lib/api-utils';

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
        const settingsDoc = await adminDb.collection('settings').doc('defaults').get();
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
    const adminsSnapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
    if (adminsSnapshot.empty) return;

    const rtdb = adminRealtimeDb;
    const notificationPayload = {
        title: "New User Signed Up",
        description: `A new user, ${user.name || user.email}, has joined the platform.`,
        icon: "user-plus",
        isRead: false,
        createdAt: new Date().toISOString(),
        link: '/admin/manage-users'
    };

    const notificationPromises = adminsSnapshot.docs.map(adminDoc => {
        const adminId = adminDoc.id;
        const notificationRef = rtdb.ref(`notifications/${adminId}`).push();
        return notificationRef.set(notificationPayload);
    });

    await Promise.all(notificationPromises);
}

export async function POST(req: Request) {
  try {

    const body = await req.json();
    const defaultCredits = await getNewUserCredits();

    if (body.uid) {
        const validation = providerSignupSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const { uid, email, name, phoneNumber } = validation.data;
        const existingProfile = await getUserProfile(uid);
        if (existingProfile) {
            return createApiResponse({ message: "User profile already exists.", user: existingProfile }, 200);
        }

        const newUserProfile = {
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
        const validation = signupSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }
        const { email, password, name } = validation.data;

        const userRecord = await adminAuth.createUser({ email, password, displayName: name });

        const newUserProfile = {
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
