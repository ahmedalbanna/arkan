
// src/app/api/features/route.ts
import { listDocs, batchWrite } from '@/lib/firebase/db-helpers';
import { defaultFeatures } from '@/lib/db/seed-data/features';
import { createApiResponse, handleApiError } from '@/lib/utils/api-utils';

// This is a public endpoint that does not require authentication
export async function GET() {
    try {
        let features = await listDocs('features');

        // Lazy seeding: If no features exist, populate from default config.
        if (features.length === 0) {
            const operations = defaultFeatures.map(feature => ({
                docId: feature.id,
                data: feature,
            }));
            await batchWrite('features', operations);
            // Re-fetch after seeding
            features = await listDocs('features');
        }

        return createApiResponse(features, 200);
    } catch (error) {
        return handleApiError(error);
    }
}
