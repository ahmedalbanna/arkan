// src/app/api/admin/templates/presentation/[id]/route.ts

import { handleApiError, withAuth, handleTemplateResult } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { TemplateController } from '@/modules/templates/adapters/controllers/TemplateController';
import { UpdatePresentationTemplateSchema } from '@/ai/schemas';

// GET a single presentation template
export const GET = withAuth(async ({ params }) => {
    try {
        const { id } = await params;
        const controller = container.resolve(TemplateController);
        const result = await controller.getTemplateById('presentation', id);

        return handleTemplateResult(result);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });


// PUT to update a presentation template
export const PUT = withAuth(async ({ request, params }) => {
    try {
        const { id } = await params;
        const body = await request.json();
        
        const validation = UpdatePresentationTemplateSchema.safeParse({ ...body, id });
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const controller = container.resolve(TemplateController);
        const checkResult = await controller.getTemplateById('presentation', id);

        if (checkResult.isFailure) {
            return handleTemplateResult(checkResult);
        }

        const result = await controller.saveTemplate('presentation', validation.data as any);
        return handleTemplateResult(result);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });


// DELETE a presentation template
export const DELETE = withAuth(async ({ params }) => {
    try {
        const { id } = await params;
        const controller = container.resolve(TemplateController);
        const result = await controller.deleteTemplate('presentation', id);
        return handleTemplateResult(result);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
