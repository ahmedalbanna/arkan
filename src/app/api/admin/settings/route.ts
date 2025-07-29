
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

// GET /api/settings - This endpoint is public
export async function GET() {
    try {
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
            return createApiResponse(defaultSettings, 200);
        }
        return createApiResponse(doc.data(), 200);
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
