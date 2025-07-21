
// src/app/api/templates/presentation/route.ts
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { PRESENTATION_GENERATION_TEMPLATES as defaultTemplates } from '@/lib/presentation-generation-templates';

export async function GET(request: Request) {
    try {
        const collectionRef = adminDb.collection('templates').doc('presentation').collection('items');
        let snapshot = await collectionRef.get();

        if (snapshot.empty) {
            console.log('No presentation templates found in Firestore, seeding...');
            const batch = adminDb.batch();
            defaultTemplates.forEach(template => {
                const docRef = collectionRef.doc(template.id);
                batch.set(docRef, template);
            });
            await batch.commit();
            console.log('Presentation templates seeded successfully.');
            snapshot = await collectionRef.get();
        }
        
        const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(templates, { status: 200 });
    } catch (error) {
        console.error('Error fetching presentation templates:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
