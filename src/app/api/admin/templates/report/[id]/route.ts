

// src/app/api/templates/report/[id]/route.ts
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
import { REPORT_GENERATION_TEMPLATES } from '@/lib/report-generation-templates';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { UpdateReportTemplateSchema } from '@/ai/schemas/template-schemas';

export const PUT = withAuth(async ({ request, params }) => {
    try {
        const id = params.id;
        const templateRef = adminDb.collection('templates').doc('report').collection('items').doc(id);
        const body = await request.json();
        const validation = UpdateReportTemplateSchema.safeParse(body);

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
