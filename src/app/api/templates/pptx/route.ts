
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { z } from 'zod';
import { container } from '@/infrastructure/di/container';
import { TemplateController } from '@/modules/templates/adapters/controllers/TemplateController';
import { templates as defaultTemplates } from '@/modules/templates/infrastructure/PptxStyles';

import { handleTemplateResult } from '@/lib/utils/api-utils';

export async function GET() {
    try {
        const controller = container.resolve(TemplateController);
        const result = await controller.getTemplates('pptx');

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

const createPptxTemplateSchema = z.object({
  id: z.string().min(3).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().min(1),
});

export const POST = withAuth(async ({ request }) => {
    try {
        const body = await request.json();
        const validation = createPptxTemplateSchema.safeParse(body);
        if(!validation.success) {
            return handleApiError(validation.error);
        }

        const { id, name, description } = validation.data;
        const controller = container.resolve(TemplateController);

        // Check if exists
        const checkResult = await controller.getTemplateById('pptx', id);
        if (checkResult.isSuccess) {
            return handleApiError({ message: 'Template already exists.' }, 409);
        }

        const result = await controller.saveTemplate('pptx', {
            id,
            name,
            description,
            styles: defaultTemplates.modern.styles,
            imageUrl: 'https://placehold.co/400x225.png',
            dataAiHint: 'presentation modern',
        } as any);

        return handleTemplateResult(result);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
