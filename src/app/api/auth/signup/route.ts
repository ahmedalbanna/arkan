/**
 * API Route للتسجيل - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
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

// دالة مساعدة للحصول على ائتمانات المستخدم الجديد
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

// دالة مساعدة لإشعار المدراء بمستخدم جديد
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

export const POST = createApiHandler(async (context) => {
    try {
        const { request } = context;
        const data = await request.json();

        // تحديد نوع التسجيل بناءً على وجود uid
        if (data.uid) {
            // تسجيل عبر مزود خارجي
            const { uid, email, name, phoneNumber } = data;
            const defaultCredits = await getNewUserCredits();

            // التحقق من وجود المستخدم أولاً
            const existingProfile = await getUserProfile(uid);
            if (existingProfile) {
                return ApiResponse.success({
                    message: "User profile already exists.",
                    user: existingProfile
                });
            }

            // محاولة إنشاء المستخدم مع معالجة خطأ الإيميل المكرر
            let userRecord;
            try {
                userRecord = await adminAuth.createUser({ email, displayName: name });
            } catch (error: any) {
                if (error.code === 'auth/email-already-exists') {
                    // إذا كان الإيميل موجود، نحاول الحصول على المستخدم الموجود
                    try {
                        userRecord = await adminAuth.getUserByEmail(email);
                    } catch (getUserError) {
                        return ApiResponse.badRequest('An account with this email address already exists.');
                    }
                } else {
                    throw error;
                }
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
            await notifyAdminsOfNewUser({
                name: newUserProfile.name ?? '',
                email: newUserProfile.email ?? ''
            });

            return ApiResponse.created({
                user: { uid: userRecord.uid, email: userRecord.email },
                message: "User profile created successfully"
            });
        } else {
            // تسجيل عادي
            const { email, password, name } = data;
            const defaultCredits = await getNewUserCredits();

            const userRecord = await adminAuth.createUser({
                email,
                password,
                displayName: name
            });

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
            await notifyAdminsOfNewUser({
                name: newUserProfile.name ?? '',
                email: newUserProfile.email ?? ''
            });

            return ApiResponse.created({
                user: { uid: userRecord.uid, email: userRecord.email ?? '' }
            });
        }
    } catch (error) {
        console.error('Signup error:', error);
        return ApiResponse.error('Failed to create user', 500);
    }
}, { validateBody: unifiedSignupSchema, requireAuth: false });
