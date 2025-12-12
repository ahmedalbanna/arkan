import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';

const updateDocxTemplateSchema = z.object({
  styles: z.object({}).passthrough(),
});

export const PUT = withAuth(async ({ request, params }) => {
    try {
        let key = params.key;
        if (!key) {
            return handleApiError({ message: 'Template key is required.' }, 400);
        }

        let templateRef = adminDb.collection('templates').doc('docx').collection('styles').doc(key);
        let templateDoc = await templateRef.get();

        if (!templateDoc.exists) {
            return handleApiError({ message: 'DOCX template not found.' }, 404);
        }

        let body = await request.json();
        let validation = updateDocxTemplateSchema.safeParse(body);

        if (!validation.success) {
            return handleApiError(validation.error);
        }

        await templateRef.update({ styles: validation.data.styles, updatedAt: new Date().toISOString() });
        let updatedDoc = await templateRef.get();

        return createApiResponse(updatedDoc.data(), 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });


export const DELETE = withAuth(async ({ params }) => {
    try {
        let key = params.key;
        if (!key) {
            return handleApiError({ message: 'Template key is required.' }, 400);
        }

        // Prevent deletion of default templates
        if (['modern', 'classic', 'academic'].includes(key)) {
            return handleApiError({ message: 'Default templates cannot be deleted.' }, 403);
        }

        let templateRef = adminDb.collection('templates').doc('docx').collection('styles').doc(key);
        let templateDoc = await templateRef.get();

        if (!templateDoc.exists) {
            return handleApiError({ message: 'DOCX template not found.' }, 404);
        }

        await templateRef.delete();

        return createApiResponse({ message: `Template "${key}" deleted successfully.` }, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
