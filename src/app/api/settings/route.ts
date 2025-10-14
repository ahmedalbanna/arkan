/**
 * API Route للإعدادات - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminDb } from '@/lib/firebase/server-init';

export const GET = createApiHandler(async (context) => {
    try {
        const settingsRef = adminDb.collection('settings').doc('defaults');
        const doc = await settingsRef.get();

        if (!doc.exists) {
            return ApiResponse.success({
                newUserCredits: 10,
                bankAccounts: []
            });
        }

        return ApiResponse.success(doc.data());
    } catch (error) {
        console.error('Error fetching settings:', error);
        return ApiResponse.error('Failed to fetch settings', 500);
    }
}, { requireAuth: false });
