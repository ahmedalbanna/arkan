// src/app/api/admin/templates/report/[id]/route.ts

import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { UpdateReportTemplateSchema } from '@/lib/types';
import { container } from '@/infrastructure/di/container';
import { TemplateController } from '@/modules/templates/adapters/controllers/TemplateController';

// GET a single report template
export const GET = withAuth(async ({ params }) => {
    try {
        const { id } = await params;
        const controller = container.resolve(TemplateController);
        const template = await controller.getTemplateById('report', id);

        if (!template) {
            return handleApiError({ message: 'Report template not found.' }, 404);
        }
        return createApiResponse(template, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });

// PUT to update a report template
export const PUT = withAuth(async ({ request, params }) => {
    try {
        const { id } = await params;
        const body = await request.json();
        
        const validation = UpdateReportTemplateSchema.safeParse({ ...body, id });
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const controller = container.resolve(TemplateController);
        const existing = await controller.getTemplateById('report', id);

        if (!existing) {
            return handleApiError({ message: 'Template not found.' }, 404);
        }

        const updated = await controller.saveTemplate('report', validation.data as any);
        return createApiResponse(updated, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });

// DELETE a report template
export const DELETE = withAuth(async ({ params }) => {
    try {
        const { id } = await params;
        const controller = container.resolve(TemplateController);
        
        // Check if it's a default template
        const template = await controller.getTemplateById('report', id);
        if (template?.isDefault) {
            return handleApiError({ message: 'Default templates cannot be deleted.' }, 403);
        }
        
        await controller.deleteTemplate('report', id);
        return createApiResponse({ message: 'Template deleted successfully.' }, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
