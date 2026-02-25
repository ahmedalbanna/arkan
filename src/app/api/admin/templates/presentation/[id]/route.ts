// src/app/api/admin/templates/presentation/[id]/route.ts

import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { adminDb } from '@/infrastructure/firebase/server-init';
import { UpdatePresentationTemplateSchema } from '@/ai/schemas';

// GET a single presentation template
export const GET = withAuth(async ({ params }) => {
    try {
        let { id } = params;
        if (!id) {
            return handleApiError({ message: 'Template ID is required.' }, 400);
        }
        let docRef = adminDb.collection('templates').doc('presentation').collection('items').doc(id);
        let doc = await docRef.get();

        if (!doc.exists) {
            return handleApiError({ message: 'Presentation template not found.' }, 404);
        }
        return createApiResponse({ id: doc.id, ...doc.data() }, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });


// PUT to update a presentation template
export const PUT = withAuth(async ({ request, params }) => {
    try {
        let { id } = params;
        if (!id) {
            return handleApiError({ message: 'Template ID is required.' }, 400);
        }

        let body = await request.json();
        let validation = UpdatePresentationTemplateSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        let docRef = adminDb.collection('templates').doc('presentation').collection('items').doc(id);
        await docRef.update(validation.data);

        let updatedDoc = await docRef.get();
        return createApiResponse({ id: updatedDoc.id, ...updatedDoc.data() }, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });


// DELETE a presentation template
export const DELETE = withAuth(async ({ params }) => {
    try {
        let { id } = params;
        if (!id) {
            return handleApiError({ message: 'Template ID is required.' }, 400);
        }
        await adminDb.collection('templates').doc('presentation').collection('items').doc(id).delete();
        return createApiResponse({ message: 'Template deleted successfully.' }, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
