/**
 * API Route للجلسة - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لإدارة الجلسات
 */

import { ComplexApiHandler, SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { createApiResponseEnhanced } from '@/lib/core/api';
import { adminAuth } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Schema لإنشاء الجلسة
const createSessionSchema = z.object({
    idToken: z.string().min(1, 'ID token is required'),
});

/**
 * معالج إنشاء الجلسة (POST)
 */
class CreateSessionHandler extends ComplexApiHandler<{
    idToken: string;
}, {
    status: string;
    expiresIn: number;
    timestamp: string;
}> {
    protected inputSchema = createSessionSchema;
    protected requiresAuth = false;

    protected async processRequest(data: any, context: any) {
        const { idToken } = data;

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
        const response = createApiResponseEnhanced(
            {
                status: 'success',
                expiresIn: expiresIn,
                timestamp: new Date().toISOString()
            },
            200
        );

        response.cookies.set(cookieOptions);

        return {
            status: 'success',
            expiresIn: expiresIn,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * معالج الحصول على معلومات الجلسة (GET)
 */
class GetSessionHandler extends SimpleApiHandler<{
    authenticated: boolean;
    user?: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
    message?: string;
    timestamp: string;
}> {
    protected async processRequest(context: any) {
        const { user } = context;

        if (!user) {
            return {
                authenticated: false,
                message: 'No active session',
                timestamp: new Date().toISOString()
            };
        }

        return {
            authenticated: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * معالج حذف الجلسة (DELETE)
 */
class DeleteSessionHandler extends SimpleApiHandler<{
    status: string;
    message: string;
    timestamp: string;
}> {
    protected async processRequest(context: any) {
        // إنشاء الاستجابة مع حذف الكوكي
        const response = createApiResponseEnhanced(
            {
                status: 'success',
                message: 'Session deleted successfully',
                timestamp: new Date().toISOString()
            },
            200
        );

        // حذف الكوكي
        response.cookies.set({
            name: '__session',
            value: '',
            maxAge: 0,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });

        return {
            status: 'success',
            message: 'Session deleted successfully',
            timestamp: new Date().toISOString()
        };
    }
}

// إنشاء المعالجات
const createSessionHandler = new CreateSessionHandler();
const getSessionHandler = new GetSessionHandler();
const deleteSessionHandler = new DeleteSessionHandler();

// تصدير الـ handlers مع middleware
export const POST = withApiMiddleware(
    createSessionHandler.handle.bind(createSessionHandler),
    {
        requireAuth: false,
        logging: true,
        rateLimit: {
            windowMs: 60000, // دقيقة واحدة
            maxRequests: 10
        }
    }
);

export const GET = withApiMiddleware(
    getSessionHandler.handle.bind(getSessionHandler),
    {
        requireAuth: false,
        logging: true
    }
);

export const DELETE = withApiMiddleware(
    deleteSessionHandler.handle.bind(deleteSessionHandler),
    {
        requireAuth: false,
        logging: true
    }
);
