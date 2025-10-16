
import { adminDb } from '@/lib/firebase/server-init';
import { createApiResponse, handleApiError } from '@/lib/api-utils';

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

// GET /api/settings - This endpoint is public for fetching bank details etc.
export async function GET() {
    try {
        const settings = await getSettings();
        return createApiResponse(settings, 200);
    } catch (error) {
        return handleApiError(error);
    }
}
