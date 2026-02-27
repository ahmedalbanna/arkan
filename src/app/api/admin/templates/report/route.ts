// src/app/api/admin/templates/report/route.ts
import { CreateReportTemplateSchema } from '@/lib/types';
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { TemplateController } from '@/modules/templates/adapters/controllers/TemplateController';

export const GET = withAuth(async () => {
    try {
        const controller = container.resolve(TemplateController);
        const templates = await controller.getTemplates('report');
        return createApiResponse(templates, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });

export const POST = withAuth(async ({ request }) => {
    try {
        let body = await request.json();
        const validation = CreateReportTemplateSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const controller = container.resolve(TemplateController);
        const existing = await controller.getTemplateById('report', validation.data.id);
        if (existing) {
            return handleApiError({ message: 'A report template with this ID already exists.' }, 409);
        }

        const newTemplate = await controller.saveTemplate('report', validation.data);
        return createApiResponse(newTemplate, 201);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
