/**
 * API Route للتسجيل - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد للتسجيل
 */

import { ComplexApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { getUserProfile } from '@/lib/db/queries';
import { adminAuth, adminDb, adminRealtimeDb } from '@/lib/firebase/server-init';
import type { UserRole } from '@/lib/models/user';
import { z } from 'zod';

// Schema للتسجيل العادي
const signupSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    name: z.string().min(1, "Name is required"),
});

// Schema للتسجيل عبر مزود خارجي
const providerSignupSchema = z.object({
    uid: z.string(),
    email: z.string().email().optional().nullable(),
    name: z.string().optional().nullable(),
    phoneNumber: z.string().optional().nullable(),
});

// Schema موحد للتسجيل
const unifiedSignupSchema = z.union([signupSchema, providerSignupSchema]);

/**
 * معالج التسجيل العادي
 */
class RegularSignupHandler extends ComplexApiHandler<{
    email: string;
    password: string;
    name: string;
}, { user: { uid: string; email: string } }> {
    protected processRequest = async (data: any, context: any) => {
        const { email, password, name } = data;
        const defaultCredits = await this.getNewUserCredits();

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
        await this.notifyAdminsOfNewUser(newUserProfile);

        return { user: { uid: userRecord.uid, email: userRecord.email } };
    }

    private async getNewUserCredits(): Promise<number> {
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

    private async notifyAdminsOfNewUser(user: { name?: string | null, email?: string | null }) {
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
}

/**
 * معالج التسجيل عبر مزود خارجي
 */
class ProviderSignupHandler extends ComplexApiHandler<{
    uid: string;
    email?: string | null;
    name?: string | null;
    phoneNumber?: string | null;
}, { message: string; user: any }> {
    protected inputSchema = providerSignupSchema;
    protected requiresAuth = false;
    protected creditCost = 1;
    protected requiresAdmin = false;

    protected async processRequest(data: any, context: any) {
        const { uid, email, name, phoneNumber } = data;
        const defaultCredits = await this.getNewUserCredits();

        const userRecord = await adminAuth.createUser({ email, password, displayName: name });
        const existingProfile = await getUserProfile(uid);
        if (existingProfile) {
            return {
                message: "User profile already exists.",
                user: existingProfile
            };
        }

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
        await this.notifyAdminsOfNewUser(newUserProfile);

        return { user: { uid: userRecord.uid, email: userRecord.email } };
    }

    private async getNewUserCredits(): Promise<number> {
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

    private async notifyAdminsOfNewUser(user: { name?: string | null, email?: string | null }) {
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
}

// Duplicate class removed - already defined above

/**
 * معالج موحد للتسجيل
 */
class UnifiedSignupHandler extends ComplexApiHandler<any, any> {
    protected inputSchema = unifiedSignupSchema;
    protected requiresAuth = false;
    protected creditCost = 1;
    protected requiresAdmin = false;

    protected async processRequest(data: any, context: any) {
        // تحديد نوع التسجيل بناءً على وجود uid
        if (data.uid) {
            const providerHandler = new ProviderSignupHandler();
            return await providerHandler.processRequest(data, context);
        } else {
            const regularHandler = new RegularSignupHandler();
            return await regularHandler.processRequest(data, context);
        }
    }
}

// إنشاء المعالجات
const regularSignupHandler = new RegularSignupHandler();
const providerSignupHandler = new ProviderSignupHandler();
const unifiedSignupHandler = new UnifiedSignupHandler();

// تصدير الـ handlers مع middleware
export const POST = withApiMiddleware(
    unifiedSignupHandler.handle.bind(unifiedSignupHandler),
    {
        requireAuth: false,
        logging: true
    }
);
