/**
 * Login API Route - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { AuthSchemas } from '@/core/validation/api-validators';
import { adminAuth } from '@/lib/firebase/server-init';

export const POST = createApiHandler(async (context) => {
    try {
        const { request } = context;
        const body = await request.json();
        const { email, password } = body;

        // التحقق من بيانات المستخدم
        const userRecord = await adminAuth.getUserByEmail(email);

        // إنشاء رمز مميز مخصص
        const customToken = await adminAuth.createCustomToken(userRecord.uid, {
            email: userRecord.email,
            role: 'user' // يمكن تحديثه من قاعدة البيانات
        });

        // حساب وقت انتهاء الصلاحية (24 ساعة)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        return ApiResponse.success({
            user: {
                id: userRecord.uid,
                email: userRecord.email,
                name: userRecord.displayName || email.split('@')[0],
                role: 'user'
            },
            token: customToken,
            expiresAt: expiresAt.toISOString()
        });
    } catch (error: any) {
        console.error('Login error:', error);

        if (error.code === 'auth/user-not-found') {
            return ApiResponse.unauthorized('Invalid email or password');
        }

        if (error.code === 'auth/invalid-email') {
            return ApiResponse.badRequest('Invalid email format');
        }

        return ApiResponse.error('Login failed', 500);
    }
}, { validateBody: AuthSchemas.login });
