
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

async function getSettings() {
    const settingsRef = adminDb.collection('settings').doc('defaults');
    const doc = await settingsRef.get();
    if (!doc.exists) {
        // If settings don't exist, create them with default values
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

// GET /api/settings - This endpoint is now public to allow fetching bank details
export async function GET() {
    try {
        const settings = await getSettings();
        return createApiResponse(settings, 200);
    } catch (error) {
        return handleApiError(error);
    }
}


// PUT /api/settings - This endpoint remains admin-only
const settingsSchema = z.object({
  newUserCredits: z.coerce.number().int().min(0),
  bankName: z.string().optional(),
  accountHolder: z.string().optional(),
  iban: z.string().optional(),
});

export const PUT = withAuth(async ({ request }) => {
    try {
        const body = await request.json();
        const validation = settingsSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const settingsRef = adminDb.collection('settings').doc('defaults');
        await settingsRef.set(validation.data, { merge: true });
        
        return createApiResponse(validation.data, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
