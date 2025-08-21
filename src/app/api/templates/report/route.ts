// src/app/api/templates/report/route.ts
import { adminDb } from '@/lib/firebase/server-init';
import { REPORT_GENERATION_TEMPLATES as defaultTemplates } from '@/lib/report-templates';
import { createApiResponse, handleApiError } from '@/lib/api-utils';

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
        return createApiResponse(templates, 200);
    } catch (error) {
        return handleApiError(error);
    }
}
