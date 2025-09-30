/**
 * API Route لإعدادات النظام - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لإعدادات النظام
 */

import { ComplexApiHandler, SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Schema لحساب البنك
const bankAccountSchema = z.object({
    bankName: z.string().min(1, 'Bank name is required.'),
    accountHolder: z.string().min(1, 'Account holder name is required.'),
    currencies: z.object({
        YER: z.object({ iban: z.string().optional() }).optional(),
        SAR: z.object({ iban: z.string().optional() }).optional(),
        USD: z.object({ iban: z.string().optional() }).optional(),
    }),
});

// Schema للإعدادات
const settingsSchema = z.object({
    newUserCredits: z.coerce.number().int().min(0),
    bankAccounts: z.array(bankAccountSchema).optional(),
});

/**
 * دالة مساعدة لجلب الإعدادات
 */
async function getSettings() {
    const settingsRef = adminDb.collection('settings').doc('defaults');
    const doc = await settingsRef.get();
    if (!doc.exists) {
        // If settings don't exist, return an empty structure.
        // The admin UI should guide the user to seed the database.
        return {
            newUserCredits: 10,
            bankAccounts: []
        };
    }
    return doc.data();
}

/**
 * معالج جلب الإعدادات
 */
class GetSettingsHandler extends SimpleApiHandler<any> {
    protected async processRequest() {
        const settings = await getSettings();
        return settings;
    }
}

/**
 * معالج تحديث الإعدادات
 */
class UpdateSettingsHandler extends ComplexApiHandler<z.infer<typeof settingsSchema>, any> {
    protected inputSchema = settingsSchema;
    protected requiresAdmin = true;

    protected async processRequest(data: z.infer<typeof settingsSchema>) {
        const settingsRef = adminDb.collection('settings').doc('defaults');
        await settingsRef.set(data, { merge: true });
        return data;
    }
}

// إنشاء المعالجات
const getSettingsHandler = new GetSettingsHandler();
const updateSettingsHandler = new UpdateSettingsHandler();

// تصدير الـ handlers مع middleware
export const GET = withApiMiddleware(
    getSettingsHandler.handle.bind(getSettingsHandler),
    { requireAuth: false, logging: true } // Public endpoint for fetching settings
);

export const PUT = withApiMiddleware(
    updateSettingsHandler.handle.bind(updateSettingsHandler),
    { requireAdmin: true, logging: true }
);
