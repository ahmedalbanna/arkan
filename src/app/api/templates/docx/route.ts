
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { z } from 'zod';
import { container } from '@/infrastructure/di/container';
import { TemplateController } from '@/modules/templates/adapters/controllers/TemplateController';
import { templates as defaultTemplates } from '@/lib/docx-styles';

export async function GET() {
    try {
        const controller = container.resolve(TemplateController);
        const templatesList = await controller.getTemplates('docx');

        const templates: { [key: string]: any } = {};
        templatesList.forEach((t) => {
            templates[t.id] = t;
        });

        return createApiResponse(templates, 200);
    } catch (error) {
        return handleApiError(error);
    }
}

const createDocxTemplateSchema = z.object({
  id: z.string().min(3).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().min(1),
});

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
        const existing = await controller.getTemplateById('docx', id);
        if (existing) {
            return handleApiError({ message: 'Template already exists.' }, 409);
        }

        const newTemplate = await controller.saveTemplate('docx', {
            id,
            name,
            description,
            styles: defaultTemplates.modern.styles,
            imageUrl: 'https://placehold.co/400x565.png',
            dataAiHint: 'document modern',
        });

        return createApiResponse(newTemplate, 201);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
