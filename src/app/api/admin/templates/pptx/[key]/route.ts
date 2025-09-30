
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

const updatePptxTemplateSchema = z.object({
    styles: z.object({}).passthrough(),
});

export const PUT = withEnhancedAuth(async ({ request, params }) => {
    try {
        const key = params.key;
        if (!key) {
            return handleApiErrorEnhanced({ message: 'Template key is required.' }, 400);
        }

        const templateRef = adminDb.collection('templates').doc('pptx').collection('styles').doc(key);
        const templateDoc = await templateRef.get();

        if (!templateDoc.exists) {
            return handleApiErrorEnhanced({ message: 'PPTX template not found.' }, 404);
        }

        const body = await request.json();
        const validation = updatePptxTemplateSchema.safeParse(body);

        if (!validation.success) {
            return handleApiErrorEnhanced(validation.error);
        }

        await templateRef.update({ styles: validation.data.styles, updatedAt: new Date().toISOString() });
        const updatedDoc = await templateRef.get();

        return createApiResponseEnhanced(updatedDoc.data(), 200);

    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
}, { requireAdmin: true });

export const DELETE = withEnhancedAuth(async ({ params }) => {
    try {
        const key = params.key;
        if (!key) {
            return handleApiErrorEnhanced({ message: 'Template key is required.' }, 400);
        }

        if (['modern', 'dark', 'professional'].includes(key)) {
            return handleApiErrorEnhanced({ message: 'Default templates cannot be deleted.' }, 403);
        }

        const templateRef = adminDb.collection('templates').doc('pptx').collection('styles').doc(key);
        const templateDoc = await templateRef.get();

        if (!templateDoc.exists) {
            return handleApiErrorEnhanced({ message: 'PPTX template not found.' }, 404);
        }

        await templateRef.delete();

        return createApiResponseEnhanced({ message: `Template "${key}" deleted successfully.` }, 200);

    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
}, { requireAdmin: true });
