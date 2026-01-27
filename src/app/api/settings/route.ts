
import { getDoc, createDoc } from '@/lib/firebase/db-helpers';
import { createApiResponse, handleApiError } from '@/lib/utils/api-utils';

async function getSettings() {
    let settings = await getDoc('settings', 'defaults');
    if (!settings) {
        // If settings don't exist, create them with default values
        const defaultSettings = {
            newUserCredits: 10,
            bankName: 'Arkan National Bank',
            accountHolder: 'Arkan Professional Platform',
            iban: 'SA03 8000 0000 6080 1016 7519',
        };
        settings = await createDoc('settings', defaultSettings);
        return settings;
    }
    return settings;
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
