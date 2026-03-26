// src/app/api/admin/templates/report/route.ts
import { CreateReportTemplateSchema } from '@/modules/templates/domain/entities/ReportTemplate';
import { handleApiError, withAuth, handleTemplateResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { TemplateController } from '@/modules/templates/adapters/controllers/TemplateController';

export const GET = withAuth(async () => {
    try {
        const controller = container.resolve(TemplateController);
        const result = await controller.getTemplates('report');
        return handleTemplateResult(result);
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
        const checkResult = await controller.getTemplateById('report', validation.data.id);
        if (checkResult.isSuccess) {
            return handleApiError({ message: 'A report template with this ID already exists.' }, 409);
        }

        const result = await controller.saveTemplate('report', validation.data as any);
        return handleTemplateResult(result);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
