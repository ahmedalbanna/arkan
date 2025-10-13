/**
 * API Route للإعدادات - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد للإعدادات
 */

import { SimpleApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { adminDb } from '@/lib/firebase/server-init';

/**
 * معالج الإعدادات
 */
class SettingsHandler extends SimpleApiHandler<any> {
    protected async processRequest(context: any) {
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
            return defaultSettings;
        }

        return doc.data();
    }
}

// إنشاء المعالج
const settingsHandler = new SettingsHandler();

// تصدير الـ handler مع middleware
export const GET = withApiMiddleware(
    settingsHandler,
    {
        requireAuth: false, // هذا الـ endpoint عام ولا يتطلب مصادقة
        logging: true
    }
);
