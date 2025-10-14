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
            // إذا لم تكن الإعدادات موجودة، قم بإنشائها بالقيم الافتراضية
            const defaultSettings = {
                newUserCredits: 10,
                bankName: 'Arkan National Bank',
                accountHolder: 'Arkan Professional Platform',
                iban: 'SA03 8000 0000 6080 1016 7519',
            };
            await settingsRef.set(defaultSettings);
            return ApiResponse.success(defaultSettings);
        }

        return ApiResponse.success(doc.data());
    } catch (error) {
        console.error('Error fetching settings:', error);
        return ApiResponse.error('Failed to fetch settings', 500);
    }
}, { requireAuth: false });
