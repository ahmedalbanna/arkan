
import { createApiResponse, handleApiError, withAuth } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { TemplateController } from '@/modules/templates/adapters/controllers/TemplateController';
import { templates as defaultTemplates } from '@/modules/ai-content/infrastructure/exporters/DocxStyles';
import { createDocxTemplateSchema } from '@/modules/users/domain/schemas/index';

import { handleTemplateResult } from '@/infrastructure/api/api-utils';

export async function GET() {
    try {
        const controller = container.resolve(TemplateController);
        const result = await controller.getTemplates('docx');

        if (result.isFailure) {
            return handleTemplateResult(result);
        }

        const templatesList = result.getValue();
        const templates: { [key: string]: any } = {};
        templatesList.forEach((t) => {
            templates[t.id] = t;
        });

        return createApiResponse(templates, 200);
    } catch (error) {
        return handleApiError(error);
    }
}

export const POST = withAuth(async ({ request }) => {
    try {
        const body = await request.json();
        const validation = createDocxTemplateSchema.safeParse(body);
        if(!validation.success) {
            return handleApiError(validation.error);
        }

        const { id, name, description } = validation.data;
        const controller = container.resolve(TemplateController);

        // Check if exists
        const checkResult = await controller.getTemplateById('docx', id);
        if (checkResult.isSuccess) {
            return handleApiError({ message: 'Template already exists.' }, 409);
        }

        const result = await controller.saveTemplate('docx', {
            id,
            name,
            description,
            styles: defaultTemplates.modern.styles,
            imageUrl: 'https://placehold.co/400x565.png',
            dataAiHint: 'document modern',
        } as any);

        return handleTemplateResult(result);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
