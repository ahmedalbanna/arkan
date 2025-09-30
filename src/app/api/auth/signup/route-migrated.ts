/**
 * Auth Signup Route - Migrated to New System
 *
 * هذا الملف يحتوي على route التسجيل المهاجر
 * مع استخدام النظام الجديد المحسن
 */

import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/core/api';
import { Analytics, PerformanceMonitor } from '@/core/performance';
import { getUserProfile } from '@/lib/db/queries';
import { adminAuth, adminDb, adminRealtimeDb } from '@/lib/firebase/server-init';
import type { UserRole } from '@/lib/models/user';
import { z } from 'zod';

// Enhanced validation schemas
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

/**
 * Get default credits for new users
 */
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

/**
 * Notify admins of new user registration
 */
async function notifyAdminsOfNewUser(user: { name?: string | null, email?: string | null }) {
    try {
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
    } catch (error) {
        console.error('Failed to notify admins of new user:', error);
    }
}

/**
 * Create user profile in database
 */
async function createUserProfile(uid: string, userData: any, defaultCredits: number): Promise<any> {
    const newUserProfile = {
        name: userData.name || `User ${uid.slice(0, 6)}`,
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
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

    return { uid, ...newUserProfile };
}

/**
 * Handle provider signup (Google, Facebook, etc.)
 */
async function handleProviderSignup(body: any, defaultCredits: number) {
    const validation = providerSignupSchema.safeParse(body);
    if (!validation.success) {
        throw new Error(`Validation failed: ${validation.error.message}`);
    }

    const { uid, email, name, phoneNumber } = validation.data;
    const existingProfile = await getUserProfile(uid);

    if (existingProfile) {
        return {
            message: "User profile already exists.",
            user: existingProfile,
            isExisting: true
        };
    }

    const userProfile = await createUserProfile(uid, { email, name, phoneNumber }, defaultCredits);
    return {
        user: userProfile,
        isExisting: false
    };
}

/**
 * Handle email/password signup
 */
async function handleEmailSignup(body: any, defaultCredits: number) {
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
        throw new Error(`Validation failed: ${validation.error.message}`);
    }

    const { email, password, name } = validation.data;
    const userRecord = await adminAuth.createUser({ email, password, displayName: name });

    const userProfile = await createUserProfile(userRecord.uid, { email, name }, defaultCredits);
    return {
        user: { uid: userRecord.uid, email: userRecord.email, ...userProfile },
        isExisting: false
    };
}

/**
 * Main signup endpoint
 */
export const POST = withEnhancedAuth(async ({ request, startTime }) => {
    try {
        const body = await request.json();
        const defaultCredits = await getNewUserCredits();

        let result;
        let signupType;

        if (body.uid) {
            // Provider signup (Google, Facebook, etc.)
            result = await handleProviderSignup(body, defaultCredits);
            signupType = 'provider';
        } else {
            // Email/password signup
            result = await handleEmailSignup(body, defaultCredits);
            signupType = 'email';
        }

        // Track performance
        PerformanceMonitor.recordEvent({
            type: 'api_call',
            name: 'user_signup',
            value: performance.now() - startTime,
            unit: 'ms',
            metadata: {
                endpoint: 'auth/signup',
                signupType,
                isExisting: result.isExisting,
                success: true
            }
        });

        // Track analytics
        Analytics.trackApiCall(
            '/api/auth/signup',
            'POST',
            performance.now() - startTime,
            true,
            result.isExisting ? 200 : 201
        );

        return createApiResponseEnhanced(
            result,
            result.isExisting ? 200 : 201,
            {
                processingTime: performance.now() - startTime,
                endpoint: 'auth/signup',
                signupType,
                defaultCredits
            }
        );

    } catch (error: any) {
        // Track error performance
        PerformanceMonitor.recordEvent({
            type: 'error',
            name: 'signup_failed',
            value: performance.now() - startTime,
            unit: 'ms',
            metadata: {
                endpoint: 'auth/signup',
                error: error.message,
                errorCode: error.code
            }
        });

        // Track error analytics
        Analytics.trackApiCall(
            '/api/auth/signup',
            'POST',
            performance.now() - startTime,
            false,
            500
        );

        // Handle specific Firebase auth errors
        if (error.code === 'auth/email-already-exists') {
            return handleApiErrorEnhanced(
                new Error("Email address is already in use by another account."),
                'signup_email_exists',
                { status: 409 }
            );
        } else if (error.code === 'auth/invalid-email') {
            return handleApiErrorEnhanced(
                new Error("The email address is not valid."),
                'signup_invalid_email',
                { status: 400 }
            );
        } else if (error.code === 'auth/weak-password') {
            return handleApiErrorEnhanced(
                new Error("The password is too weak. It must be at least 6 characters long."),
                'signup_weak_password',
                { status: 400 }
            );
        }

        return handleApiErrorEnhanced(error, 'signup_processing');
    }
}, {
    requireAuth: false, // Signup doesn't require auth
    performanceTracking: true,
    analytics: true,
    rateLimit: {
        maxRequests: 5, // Limit signup attempts
        windowMs: 300000 // 5 minutes
    }
});

/**
 * Get signup statistics (admin only)
 */
export const GET = withEnhancedAuth(async ({ request, user, startTime }) => {
    try {
        // Only admins can access signup statistics
        if (user?.role !== 'admin') {
            return handleApiErrorEnhanced(
                new Error('Forbidden: Admin access required'),
                'signup_stats_admin_only',
                { status: 403 }
            );
        }

        // Get signup statistics
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const todaySignups = await adminDb
            .collection('users')
            .where('createdAt', '>=', startOfDay.toISOString())
            .get();

        const totalUsers = await adminDb.collection('users').get();

        const stats = {
            todaySignups: todaySignups.size,
            totalUsers: totalUsers.size,
            date: today.toISOString()
        };

        return createApiResponseEnhanced(
            stats,
            200,
            {
                processingTime: performance.now() - startTime,
                endpoint: 'auth/signup/stats'
            }
        );

    } catch (error: any) {
        return handleApiErrorEnhanced(error, 'signup_stats');
    }
}, {
    requireAdmin: true,
    performanceTracking: true,
    analytics: true
});
