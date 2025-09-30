// src/app/api/templates/pptx/route.ts
import { createApiResponseEnhanced, handleApiErrorEnhanced } from '@/lib/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import { templates as defaultTemplates, type PptxTemplateKey } from '@/lib/pptx-styles';

// This endpoint is public and does not require authentication
// as all users need to be able to fetch the templates for exporting.
export async function GET() {
    try {
        const stylesCollection = adminDb.collection('templates').doc('pptx').collection('styles');
        let snapshot = await stylesCollection.get();

        // Lazy seeding: If no templates exist, populate them from the default config.
        if (snapshot.empty) {
            const batch = adminDb.batch();
            (Object.keys(defaultTemplates) as PptxTemplateKey[]).forEach(key => {
                const template = defaultTemplates[key];
                const docRef = stylesCollection.doc(key);
                batch.set(docRef, { ...template, id: key, createdAt: new Date().toISOString() });
            });
            await batch.commit();
            snapshot = await stylesCollection.get(); // Re-fetch after seeding
        }

        const templates: { [key: string]: any } = {};
        snapshot.docs.forEach((doc) => {
            templates[doc.id] = doc.data();
        });

        return createApiResponseEnhanced(templates, 200);
    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
}
