import { z } from 'zod';
import { getNestedDoc, updateNestedDoc, deleteNestedDoc } from '@/lib/firebase/db-helpers';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';

const updatePptxTemplateSchema = z.object({
  styles: z.object({}).passthrough(),
});

export const PUT = withAuth(async ({ request, params }) => {
    try {
        const key = params.key;
        if (!key) {
            return handleApiError({ message: 'Template key is required.' }, 400);
        }

        const stylesPath = {
            parentCollection: 'templates',
            parentDocId: 'pptx',
            subcollection: 'styles',
        };

        const templateDoc = await getNestedDoc(stylesPath, key);

        if (!templateDoc) {
            return handleApiError({ message: 'PPTX template not found.' }, 404);
        }

        const body = await request.json();
        const validation = updatePptxTemplateSchema.safeParse(body);

        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const updated = await updateNestedDoc(stylesPath, key, {
            styles: validation.data.styles,
            updatedAt: new Date().toISOString(),
        });

        return createApiResponse(updated, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });


export const DELETE = withAuth(async ({ params }) => {
    try {
        const key = params.key;
        if (!key) {
            return handleApiError({ message: 'Template key is required.' }, 400);
        }

        // Prevent deletion of default templates
        if (['modern', 'elegant', 'minimal'].includes(key)) {
            return handleApiError({ message: 'Default templates cannot be deleted.' }, 403);
        }

        const stylesPath = {
            parentCollection: 'templates',
            parentDocId: 'pptx',
            subcollection: 'styles',
        };

        const templateDoc = await getNestedDoc(stylesPath, key);

        if (!templateDoc) {
            return handleApiError({ message: 'PPTX template not found.' }, 404);
        }

        await deleteNestedDoc(stylesPath, key);

        return createApiResponse({ message: `Template "${key}" deleted successfully.` }, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
