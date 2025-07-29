
// src/app/api/templates/presentation/[id]/route.ts
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
import { PRESENTATION_GENERATION_TEMPLATES } from '@/lib/presentation-generation-templates';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const updateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  primaryAgentId: z.string().optional(),
  relevantReportSectionIds: z.array(z.string()).optional(),
});

export const PUT = withAuth(async ({ request, params }) => {
    try {
        const { id } = params;
        const templateRef = adminDb.collection('templates').doc('presentation').collection('items').doc(id);
        const body = await request.json();
        const validation = updateSchema.safeParse(body);

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
        const { id } = params;

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
