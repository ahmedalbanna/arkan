
'use server';

import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

const bankAccountSchema = z.object({
    bankName: z.string().min(1, 'Bank name is required.'),
    accountHolder: z.string().min(1, 'Account holder name is required.'),
    currencies: z.object({
        YER: z.object({ iban: z.string().optional() }).optional(),
        SAR: z.object({ iban: z.string().optional() }).optional(),
        USD: z.object({ iban: z.string().optional() }).optional(),
    }),
});

const settingsSchema = z.object({
    newUserCredits: z.coerce.number().int().min(0),
    bankAccounts: z.array(bankAccountSchema).optional(),
});


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

// GET /api/settings - This endpoint is public to allow fetching bank details
export async function GET() {
    try {
        const settings = await getSettings();
        return createApiResponseEnhanced(settings, 200);
    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
}

// PUT /api/settings - This endpoint remains admin-only
export const PUT = withEnhancedAuth(async ({ request }) => {
    try {
        const body = await request.json();
        const validation = settingsSchema.safeParse(body);
        if (!validation.success) {
            return handleApiErrorEnhanced(validation.error);
        }

        const settingsRef = adminDb.collection('settings').doc('defaults');
        await settingsRef.set(validation.data, { merge: true });

        return createApiResponseEnhanced(validation.data, 200);
    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
}, { requireAdmin: true });
