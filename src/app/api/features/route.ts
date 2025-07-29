
// src/app/api/features/route.ts
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { defaultFeatures } from '@/lib/features';

// This is a public endpoint that does not require authentication.
// It allows all users to know which features are enabled.
export async function GET() {
    try {
        const featuresCollection = adminDb.collection('features');
        let snapshot = await featuresCollection.get();

        // Lazy seeding: If no features exist, populate them from the default config.
        if (snapshot.empty) {
            console.log('No features found in Firestore, seeding...');
            const batch = adminDb.batch();
            defaultFeatures.forEach(feature => {
                const docRef = featuresCollection.doc(feature.id);
                batch.set(docRef, feature);
            });
            await batch.commit();
            console.log('Features seeded successfully.');
            snapshot = await featuresCollection.get(); // Re-fetch after seeding
        }
        
        const features = snapshot.docs.map(doc => doc.data());
        return NextResponse.json(features, { status: 200 });

    } catch (error) {
        console.error('Error fetching features:', error);
        return NextResponse.json({ message: 'An unexpected error occurred while fetching features.' }, { status: 500 });
    }
}
