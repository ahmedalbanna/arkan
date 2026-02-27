// src/app/api/admin/templates/presentation/[id]/route.ts

import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { TemplateController } from '@/modules/templates/adapters/controllers/TemplateController';
import { UpdatePresentationTemplateSchema } from '@/ai/schemas';

// GET a single presentation template
export const GET = withAuth(async ({ params }) => {
    try {
        const { id } = await params;
        const controller = container.resolve(TemplateController);
        const template = await controller.getTemplateById('presentation', id);

        if (!template) {
            return handleApiError({ message: 'Presentation template not found.' }, 404);
        }
        return createApiResponse(template, 200);
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
        const existing = await controller.getTemplateById('presentation', id);

        if (!existing) {
            return handleApiError({ message: 'Template not found.' }, 404);
        }

        const updated = await controller.saveTemplate('presentation', validation.data as any);
        return createApiResponse(updated, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });


// DELETE a presentation template
export const DELETE = withAuth(async ({ params }) => {
    try {
        const { id } = await params;
        const controller = container.resolve(TemplateController);
        await controller.deleteTemplate('presentation', id);
        return createApiResponse({ message: 'Template deleted successfully.' }, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
