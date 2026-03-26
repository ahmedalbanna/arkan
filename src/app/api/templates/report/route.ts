
// src/app/api/templates/report/route.ts
import { CreateReportTemplateSchema, UpdateReportTemplateSchema } from '@/infrastructure/utils/types';
import { createApiResponse, handleApiError, withAuth } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { TemplateController } from '@/modules/templates/adapters/controllers/TemplateController';

// This is a public endpoint that does not require authentication
// as all users need to be able to fetch the templates for building reports.
import { handleTemplateResult } from '@/infrastructure/api/api-utils';

// This is a public endpoint that does not require authentication
// as all users need to be able to fetch the templates for building reports.
export async function GET() {
    try {
        const controller = container.resolve(TemplateController);
        const result = await controller.getTemplates('report');
        return handleTemplateResult(result);
    } catch (error) {
        return handleApiError(error);
    }
}

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

export const PUT = withAuth(async ({ request }) => {
    try {
        const body = await request.json();
        const validation = UpdateReportTemplateSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const { id, ...data } = validation.data as { id?: string } & Record<string, any>;
        if (!id) {
            return handleApiError({ message: 'Template ID is required.' }, 400);
        }

        const controller = container.resolve(TemplateController);
        const checkResult = await controller.getTemplateById('report', id);
        if (checkResult.isFailure) {
            return handleTemplateResult(checkResult);
        }

        const result = await controller.saveTemplate('report', { id, ...data } as any);
        return handleTemplateResult(result);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
