// src/app/api/templates/presentation/route.ts
import { createApiResponseEnhanced, handleApiErrorEnhanced } from '@/lib/core/api';
import { PRESENTATION_GENERATION_TEMPLATES as defaultTemplates } from '@/lib/db/seed-data/presentation-templates';
import { adminDb } from '@/lib/firebase/server-init';

/**
 * معالج جلب قوالب العروض التقديمية
 */
export async function GET() {
    try {
        const collectionRef = adminDb.collection('templates').doc('presentation').collection('items');
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
        return handleApiErrorEnhanced(error, '500');
    }
}
