
// src/app/api/templates/proposal/route.ts
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { templates as defaultTemplates } from '@/lib/proposal-templates';

// This endpoint is public for now, but could be restricted
export async function GET(request: Request) {
    try {
        const collectionRef = adminDb.collection('templates').doc('proposal').collection('items');
        let snapshot = await collectionRef.get();

        if (snapshot.empty) {
            const batch = adminDb.batch();
            Object.entries(defaultTemplates).forEach(([key, template]) => {
                const docRef = collectionRef.doc(key);
                batch.set(docRef, { ...template, id: key });
            });
            await batch.commit();
            snapshot = await collectionRef.get();
        }
        
        const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(templates, { status: 200 });
    } catch (error) {
        console.error('Error fetching proposal templates:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
