// src/app/api/admin/templates/report/[id]/route.ts

import { handleApiError, withAuth, handleTemplateResult } from '@/infrastructure/api/api-utils';
import { UpdateReportTemplateSchema } from '@/infrastructure/utils/types';
import { container } from '@/infrastructure/di/container';
import { TemplateController } from '@/modules/templates/adapters/controllers/TemplateController';

// GET a single report template
export const GET = withAuth(async ({ params }) => {
    try {
        const { id } = await params;
        const controller = container.resolve(TemplateController);
        const result = await controller.getTemplateById('report', id);

        return handleTemplateResult(result);
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
        const checkResult = await controller.getTemplateById('report', id);

        if (checkResult.isFailure) {
            return handleTemplateResult(checkResult);
        }

        const result = await controller.saveTemplate('report', validation.data as any);
        return handleTemplateResult(result);
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
        const checkResult = await controller.getTemplateById('report', id);
        if (checkResult.isSuccess && checkResult.getValue().isDefault) {
            return handleApiError({ message: 'Default templates cannot be deleted.' }, 403);
        }
        
        const result = await controller.deleteTemplate('report', id);
        return handleTemplateResult(result);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
