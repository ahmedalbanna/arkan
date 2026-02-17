import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';

const updatePptxTemplateSchema = z.object({
  styles: z.object({}).passthrough(),
});

export const PUT = withAuth(async ({ request, params }) => {
    try {
        const resolvedParams = await params;
        let key = resolvedParams.key;
        if (!key) {
            return handleApiError({ message: 'Template key is required.' }, 400);
        }

        let template = await prisma.pptxTemplate.findUnique({
            where: { id: key },
        });

        if (!template) {
            return handleApiError({ message: 'PPTX template not found.' }, 404);
        }

        let body = await request.json();
        let validation = updatePptxTemplateSchema.safeParse(body);

        if (!validation.success) {
            return handleApiError(validation.error);
        }

        let updatedTemplate = await prisma.pptxTemplate.update({
            where: { id: key },
            data: { styles: validation.data.styles },
        });

        return createApiResponse(updatedTemplate, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });

export const DELETE = withAuth(async ({ params }) => {
    try {
        const resolvedParams = await params;
        let key = resolvedParams.key;
        if (!key) {
            return handleApiError({ message: 'Template key is required.' }, 400);
        }

        if (['modern', 'dark', 'professional'].includes(key)) {
            return handleApiError({ message: 'Default templates cannot be deleted.' }, 403);
        }

        let template = await prisma.pptxTemplate.findUnique({
            where: { id: key },
        });

        if (!template) {
            return handleApiError({ message: 'PPTX template not found.' }, 404);
        }

        await prisma.pptxTemplate.delete({
            where: { id: key },
        });

        return createApiResponse({ message: `Template "${key}" deleted successfully.` }, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
