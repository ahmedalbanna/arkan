/**
 * API Route لإعدادات النظام - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
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

// دالة مساعدة لجلب الإعدادات
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

export const GET = createApiHandler(async () => {
    try {
        const settings = await getSettings();
        return ApiResponse.success(settings);
    } catch (error) {
        console.error('Get settings error:', error);
        return ApiResponse.error('Failed to get settings', 500);
    }
}, { requireAuth: false });

export const PUT = createApiHandler(async (context) => {
    try {
        const { request } = context;
        const data = await request.json();

        const settingsRef = adminDb.collection('settings').doc('defaults');
        await settingsRef.set(data, { merge: true });

        return ApiResponse.success(data);
    } catch (error) {
        console.error('Update settings error:', error);
        return ApiResponse.error('Failed to update settings', 500);
    }
}, { validateBody: settingsSchema, requireAdmin: true });
