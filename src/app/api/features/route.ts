// src/app/api/features/route.ts
import { adminDb } from '@/lib/firebase/server-init';
import { defaultFeatures } from '@/lib/features';
import { createApiResponse, handleApiError } from '@/lib/api-utils';

// This is a public endpoint that does not require authentication
export async function GET() {
    try {
        const featuresCollection = adminDb.collection('features');
        let snapshot = await featuresCollection.get();

        // Lazy seeding: If no features exist, populate from default config.
        if (snapshot.empty) {
            const batch = adminDb.batch();
            defaultFeatures.forEach(feature => {
                const docRef = featuresCollection.doc(feature.id);
                batch.set(docRef, feature);
            });
            await batch.commit();
            snapshot = await featuresCollection.get(); // Re-fetch after seeding
        }
        
        const features = snapshot.docs.map(doc => doc.data());

        return createApiResponse(features, 200);
    } catch (error) {
        return handleApiError(error);
    }
}
