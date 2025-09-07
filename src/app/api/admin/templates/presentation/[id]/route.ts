

// src/app/api/templates/presentation/[id]/route.ts
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
import { PRESENTATION_GENERATION_TEMPLATES } from '@/lib/db/seed-data/presentation-templates';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { UpdatePresentationTemplateSchema } from '@/ai/schemas/template-schemas';


export const PUT = withAuth(async ({ request, params }) => {
    try {
        const id = params.id;
        const templateRef = adminDb.collection('templates').doc('presentation').collection('items').doc(id);
        const body = await request.json();
        const validation = UpdatePresentationTemplateSchema.safeParse(body);

        if (!validation.success) {
            return handleApiError(validation.error);
        }

        await templateRef.update({ ...validation.data, updatedAt: new Date().toISOString() });
        const updatedDoc = await templateRef.get();

        return createApiResponse({ id: updatedDoc.id, ...updatedDoc.data() }, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });


export const DELETE = withAuth(async ({ params }) => {
    try {
        const id = params.id;

        if (PRESENTATION_GENERATION_TEMPLATES.some(t => t.id === id)) {
            return handleApiError({ message: 'Default templates cannot be deleted.' }, 403);
        }

        const templateRef = adminDb.collection('templates').doc('presentation').collection('items').doc(id);
        const doc = await templateRef.get();
        if (!doc.exists) {
            return handleApiError({ message: 'Template not found.' }, 404);
        }

        await templateRef.delete();

        return createApiResponse({ message: `Template "${id}" deleted successfully.` }, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
