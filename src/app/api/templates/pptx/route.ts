// src/app/api/templates/pptx/route.ts
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
import { templates as defaultTemplates, type PptxTemplateKey } from '@/lib/pptx-styles';
import { withAuth, createApiResponse, handleApiError } from '@/lib/utils/api-utils';
import { createGenerativeTemplate } from '@/services/templateService';

// This endpoint is public and does not require authentication
// as all users need to be able to fetch the templates for exporting.
export async function GET() {
    try {
        let stylesCollection = adminDb.collection('templates').doc('pptx').collection('styles');
        let snapshot = await stylesCollection.get();

        // Lazy seeding: If no templates exist, populate them from the default config.
        if (snapshot.empty) {
            let batch = adminDb.batch();
            (Object.keys(defaultTemplates) as PptxTemplateKey[]).forEach(key => {
                let template = defaultTemplates[key];
                let docRef = stylesCollection.doc(key);
                batch.set(docRef, { ...template, id: key, createdAt: new Date().toISOString() });
            });
            await batch.commit();
            snapshot = await stylesCollection.get(); // Re-fetch after seeding
        }

        let templates: Record<string, unknown> = {};
        snapshot.docs.forEach((doc) => {
            templates[doc.id] = doc.data();
        });

        return createApiResponse(templates, 200);
    } catch (error) {
        return handleApiError(error);
    }
}


const createPptxTemplateSchema = z.object({
  id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens."),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

export const POST = withAuth(async ({ request }) => {
    try {
        let body = await request.json();
        let validation = createPptxTemplateSchema.safeParse(body);
        if(!validation.success) {
            return handleApiError(validation.error);
        }

        let { id, name, description } = validation.data;

        // Create a new template based on the 'modern' default
        let newTemplateData = {
            name,
            description,
            styles: defaultTemplates.modern.styles,
            imageUrl: 'https://placehold.co/400x225.png',
            dataAiHint: 'presentation modern',
        };

        let newTemplate = await createGenerativeTemplate('pptx', id, newTemplateData);

        return createApiResponse(newTemplate, 201);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
