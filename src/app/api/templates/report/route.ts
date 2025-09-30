// src/app/api/templates/report/route.ts
import { createApiResponseEnhanced, handleApiErrorEnhanced } from '@/lib/core/api';
import { REPORT_GENERATION_TEMPLATES as defaultTemplates } from '@/lib/db/seed-data/report-templates';
import { adminDb } from '@/lib/firebase/server-init';

// This is a public endpoint
export async function GET() {
    try {
        const collectionRef = adminDb.collection('templates').doc('report').collection('items');
        let snapshot = await collectionRef.get();

        if (snapshot.empty) {
            const batch = adminDb.batch();
            defaultTemplates.forEach(template => {
                const docRef = collectionRef.doc(template.id);
                batch.set(docRef, template);
            });
            await batch.commit();
            snapshot = await collectionRef.get();
        }

        const templates = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return createApiResponseEnhanced(templates, 200);
    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
}
