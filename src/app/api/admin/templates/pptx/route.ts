// src/app/api/templates/pptx/route.ts
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { createGenerativeTemplate } from '@/lib/db/queries';
import { adminDb } from '@/lib/firebase/server-init';
import { templates as defaultTemplates, type PptxTemplateKey } from '@/lib/pptx-styles';
import { z } from 'zod';
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


const createPptxTemplateSchema = z.object({
    id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens."),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
});

export const POST = withEnhancedAuth(async ({ request }) => {
    try {
        const body = await request.json();
        const validation = createPptxTemplateSchema.safeParse(body);
        if (!validation.success) {
            return handleApiErrorEnhanced(validation.error);
        }

        const { id, name, description } = validation.data;

        // Create a new template based on the 'modern' default
        const newTemplateData = {
            name,
            description,
            styles: defaultTemplates.modern.styles,
            imageUrl: 'https://placehold.co/400x225.png',
            dataAiHint: 'presentation modern',
        };

        const newTemplate = await createGenerativeTemplate('pptx', id, newTemplateData);

        return createApiResponseEnhanced(newTemplate, 201);
    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
}, { requireAdmin: true });
