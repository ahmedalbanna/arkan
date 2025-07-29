// src/app/api/templates/proposal/route.ts
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/server-init';
import { PROPOSAL_TEMPLATES as defaultTemplates } from '@/lib/proposal-templates';

// This endpoint is public for now, but could be restricted
export async function GET(request: Request) {
    try {
        const collectionRef = adminDb.collection('templates').doc('proposal').collection('items');
        let snapshot = await collectionRef.get();

        if (snapshot.empty) {
            console.log('No proposal templates found in Firestore, seeding...');
            const batch = adminDb.batch();
            defaultTemplates.forEach((template) => {
                const docRef = collectionRef.doc(template.id);
                batch.set(docRef, template);
            });
            await batch.commit();
            console.log('Proposal templates seeded successfully.');
            snapshot = await collectionRef.get();
        }
        
        const templates = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(templates, { status: 200 });
    } catch (error) {
        console.error('Error fetching proposal templates:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
