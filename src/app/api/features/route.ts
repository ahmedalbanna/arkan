
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { defaultFeatures } from '@/lib/features';

// GET /api/features - This endpoint is public for all authenticated users to check feature flags.
export async function GET(request: Request) {
    try {
        const featuresCollection = adminDb.collection('features');
        let snapshot = await featuresCollection.get();

        // Lazy seeding: If no features exist, populate them from the default config.
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
        return NextResponse.json(features, { status: 200 });

    } catch (error) {
        console.error('Error fetching features:', error);
        return NextResponse.json({ message: 'An unexpected error occurred while fetching features.' }, { status: 500 });
    }
}
