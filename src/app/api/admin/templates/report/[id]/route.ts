// src/app/api/admin/templates/report/[id]/route.ts

import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { adminDb } from '@/lib/firebase/server-init';
import { UpdateReportTemplateSchema } from '@/ai/schemas';

// GET a single report template
export const GET = withAuth(async ({ params }) => {
    try {
        const { id } = params;
        if (!id) {
            return handleApiError({ message: 'Template ID is required.' }, 400);
        }
        const docRef = adminDb.collection('templates').doc('report').collection('items').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return handleApiError({ message: 'Report template not found.' }, 404);
        }
        return createApiResponse({ id: doc.id, ...doc.data() }, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });

// PUT to update a report template
export const PUT = withAuth(async ({ request, params }) => {
    try {
        const { id } = params;
        if (!id) {
            return handleApiError({ message: 'Template ID is required.' }, 400);
        }

        const body = await request.json();
        const validation = UpdateReportTemplateSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const docRef = adminDb.collection('templates').doc('report').collection('items').doc(id);
        await docRef.update(validation.data);

        const updatedDoc = await docRef.get();
        return createApiResponse({ id: updatedDoc.id, ...updatedDoc.data() }, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });

// DELETE a report template
export const DELETE = withAuth(async ({ params }) => {
    try {
        const { id } = params;
        if (!id) {
            return handleApiError({ message: 'Template ID is required.' }, 400);
        }
        await adminDb.collection('templates').doc('report').collection('items').doc(id).delete();
        return createApiResponse({ message: 'Template deleted successfully.' }, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
