
// src/app/api/templates/report/[id]/route.ts
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
import { REPORT_GENERATION_TEMPLATES } from '@/lib/report-generation-templates';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const updateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  agentIds: z.array(z.string()).min(1, "At least one agent ID is required.").optional(),
});

export const PUT = withAuth(async ({ request, params }) => {
    try {
        const { id } = params;
        const templateRef = adminDb.collection('templates').doc('report').collection('items').doc(id);
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

        if (REPORT_GENERATION_TEMPLATES.some(t => t.id === id)) {
            return handleApiError({ message: 'Default templates cannot be deleted.' }, 403);
        }

        const templateRef = adminDb.collection('templates').doc('report').collection('items').doc(id);
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
