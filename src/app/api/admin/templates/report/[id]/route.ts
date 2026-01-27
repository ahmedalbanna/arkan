// src/app/api/admin/templates/report/[id]/route.ts

import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { getNestedDoc, updateNestedDoc, deleteNestedDoc } from '@/lib/firebase/db-helpers';
import { UpdateReportTemplateSchema } from '@/lib/models';
import { defaultReportTemplates } from '@/lib/db/seed-data/report-templates';

// GET a single report template
export const GET = withAuth(async ({ params }) => {
    try {
        const { id } = params;
        if (!id) {
            return handleApiError({ message: 'Template ID is required.' }, 400);
        }

        const templatesPath = {
            parentCollection: 'templates',
            parentDocId: 'report',
            subcollection: 'items',
        };

        const doc = await getNestedDoc(templatesPath, id);

        if (!doc) {
            return handleApiError({ message: 'Report template not found.' }, 404);
        }
        return createApiResponse(doc, 200);
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
        // The body now contains the full content structure
        const validation = UpdateReportTemplateSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const templatesPath = {
            parentCollection: 'templates',
            parentDocId: 'report',
            subcollection: 'items',
        };

        const updated = await updateNestedDoc(templatesPath, id, validation.data);
        return createApiResponse(updated, 200);

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
        
        // Prevent deletion of default templates
        const defaultIds = defaultReportTemplates.filter(t => t.isDefault).map(t => t.id);
        if (defaultIds.includes(id)) {
            return handleApiError({ message: 'Default templates cannot be deleted.' }, 403);
        }
        
        const templatesPath = {
            parentCollection: 'templates',
            parentDocId: 'report',
            subcollection: 'items',
        };

        await deleteNestedDoc(templatesPath, id);
        return createApiResponse({ message: 'Template deleted successfully.' }, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
