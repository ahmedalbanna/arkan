/**
 * API Route للجلسة - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminAuth } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Schema لإنشاء الجلسة
const createSessionSchema = z.object({
    idToken: z.string().min(1, 'ID token is required'),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { request } = context;
        const { idToken } = await request.json();

        // إنشاء كوكي الجلسة
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 أيام
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        // إعداد خيارات الكوكي
        const cookieOptions = {
            name: '__session',
            value: sessionCookie,
            maxAge: expiresIn,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax' as const,
        };

        // تعيين الكوكي في الاستجابة
        const response = ApiResponse.success({
            status: 'success',
            expiresIn: expiresIn,
            timestamp: new Date().toISOString()
        });

        response.cookies.set(cookieOptions);

        return response;
    } catch (error) {
        console.error('Create session error:', error);
        return ApiResponse.error('Failed to create session', 500);
    }
}, { validateBody: createSessionSchema, requireAuth: false });

export const GET = createApiHandler(async (context) => {
    try {
        const { user } = context;

        if (!user) {
            return ApiResponse.success({
                authenticated: false,
                message: 'No active session',
                timestamp: new Date().toISOString()
            });
        }

        return ApiResponse.success({
            authenticated: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Get session error:', error);
        return ApiResponse.error('Failed to get session', 500);
    }
}, { requireAuth: false });

export const DELETE = createApiHandler(async (context) => {
    try {
        // إنشاء الاستجابة مع حذف الكوكي
        const response = ApiResponse.success({
            status: 'success',
            message: 'Session deleted successfully',
            timestamp: new Date().toISOString()
        });

        // حذف الكوكي
        response.cookies.set({
            name: '__session',
            value: '',
            maxAge: 0,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Delete session error:', error);
        return ApiResponse.error('Failed to delete session', 500);
    }
}, { requireAuth: false });
