// src/app/api/templates/proposal/route.ts
import { createApiResponseEnhanced, handleApiErrorEnhanced } from '@/lib/core/api';
import { PROPOSAL_TEMPLATES as defaultTemplates } from '@/lib/db/seed-data/proposal-templates';
import { adminDb } from '@/lib/firebase/server-init';

/**
 * معالج جلب قوالب المقترحات
 */
export async function GET() {
    try {
        const collectionRef = adminDb.collection('templates').doc('proposal').collection('items');
        let snapshot = await collectionRef.get();

        if (snapshot.empty) {
            const batch = adminDb.batch();
            defaultTemplates.forEach((template) => {
                const docRef = collectionRef.doc(template.id);
                batch.set(docRef, template);
            });
            await batch.commit();
            snapshot = await collectionRef.get();
        }

        const templates = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return createApiResponseEnhanced(templates, 200);
    } catch (error) {
        return handleApiErrorEnhanced(error, '500');
    }
}
