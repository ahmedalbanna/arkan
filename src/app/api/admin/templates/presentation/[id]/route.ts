// src/app/api/admin/templates/presentation/[id]/route.ts

import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { getNestedDoc, updateNestedDoc, deleteNestedDoc } from '@/lib/firebase/db-helpers';
import { PresentationGenerationTemplateSchema, UpdatePresentationTemplateSchema } from '@/ai/schemas';

// GET a single presentation template
export const GET = withAuth(async ({ params }) => {
    try {
        const { id } = params;
        if (!id) {
            return handleApiError({ message: 'Template ID is required.' }, 400);
        }

        const templatesPath = {
            parentCollection: 'templates',
            parentDocId: 'presentation',
            subcollection: 'items',
        };

        const doc = await getNestedDoc(templatesPath, id);

        if (!doc) {
            return handleApiError({ message: 'Presentation template not found.' }, 404);
        }
        return createApiResponse(doc, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });


// PUT to update a presentation template
export const PUT = withAuth(async ({ request, params }) => {
    try {
        const { id } = params;
        if (!id) {
            return handleApiError({ message: 'Template ID is required.' }, 400);
        }

        const body = await request.json();
        const validation = UpdatePresentationTemplateSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const templatesPath = {
            parentCollection: 'templates',
            parentDocId: 'presentation',
            subcollection: 'items',
        };

        const updated = await updateNestedDoc(templatesPath, id, validation.data);
        return createApiResponse(updated, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });


// DELETE a presentation template
export const DELETE = withAuth(async ({ params }) => {
    try {
        const { id } = params;
        if (!id) {
            return handleApiError({ message: 'Template ID is required.' }, 400);
        }

        const templatesPath = {
            parentCollection: 'templates',
            parentDocId: 'presentation',
            subcollection: 'items',
        };

        await deleteNestedDoc(templatesPath, id);
        return createApiResponse({ message: 'Template deleted successfully.' }, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
