// src/app/api/templates/docx/route.ts
import { listNestedDocs, batchWriteNested } from '@/lib/firebase/db-helpers';
import { templates as defaultTemplates, type DocxTemplateKey } from '@/lib/docx-styles';
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { z } from 'zod';
import { createGenerativeTemplate } from '@/services/templateService';

// This endpoint is public and does not require authentication
// as all users need to be able to fetch the templates for exporting.
export async function GET() {
    try {
        const stylesPath = {
            parentCollection: 'templates',
            parentDocId: 'docx',
            subcollection: 'styles',
        };

        let templates = await listNestedDocs(stylesPath);

        // Lazy seeding: If no templates exist, populate them from the default config.
        if (templates.length === 0) {
            const operations = (Object.keys(defaultTemplates) as DocxTemplateKey[]).map(key => ({
                docId: key,
                data: {
                    ...defaultTemplates[key],
                    id: key,
                    createdAt: new Date().toISOString(),
                } as any,
            }));
            await batchWriteNested(stylesPath, operations);
            // Re-fetch after seeding
            templates = await listNestedDocs(stylesPath);
        }

        const result: { [key: string]: any } = {};
        templates.forEach((doc) => {
            result[(doc as any).id] = doc;
        });

        return createApiResponse(result, 200);
    } catch (error) {
        return handleApiError(error);
    }
}


const createDocxTemplateSchema = z.object({
  id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens."),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

export const POST = withAuth(async ({ request }) => {
    try {
        const body = await request.json();
        const validation = createDocxTemplateSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const { id, name, description } = validation.data;

        // Create a new template based on the 'modern' default
        const newTemplateData = {
            name,
            description,
            styles: defaultTemplates.modern.styles,
            imageUrl: 'https://placehold.co/400x565.png',
            dataAiHint: 'document modern',
        };

        const newTemplate = await createGenerativeTemplate('docx', id, newTemplateData);

        return createApiResponse(newTemplate, 201);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
