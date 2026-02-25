
import { z } from 'zod';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { TemplateController } from '@/modules/templates/adapters/controllers/TemplateController';

const updatePptxTemplateSchema = z.object({
  styles: z.object({}).passthrough(),
});

export const PUT = withAuth(async ({ request, params }) => {
    try {
        const { key } = await params;
        if (!key) {
            return handleApiError({ message: 'Template key is required.' }, 400);
        }

        const body = await request.json();
        const validation = updatePptxTemplateSchema.safeParse(body);

        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const controller = container.resolve(TemplateController);
        const updatedTemplate = await controller.saveTemplate('pptx', {
            id: key,
            ...validation.data
        });

        return createApiResponse(updatedTemplate, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });

export const DELETE = withAuth(async ({ params }) => {
    try {
        const { key } = await params;
        if (!key) {
            return handleApiError({ message: 'Template key is required.' }, 400);
        }

        if (['modern', 'dark', 'professional'].includes(key)) {
            return handleApiError({ message: 'Default templates cannot be deleted.' }, 403);
        }

        const controller = container.resolve(TemplateController);
        await controller.deleteTemplate('pptx', key);

        return createApiResponse({ message: `Template "${key}" deleted successfully.` }, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
