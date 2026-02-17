import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import prisma from '@/lib/db/prisma';
import { UpdatePresentationTemplateSchema } from '@/ai/schemas';

// GET a single presentation template
export const GET = withAuth(async ({ params }) => {
    try {
        const resolvedParams = await params;
        let { id } = resolvedParams;
        if (!id) {
            return handleApiError({ message: 'Template ID is required.' }, 400);
        }
        let template = await prisma.pptxTemplate.findUnique({
            where: { id },
        });

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
        const resolvedParams = await params;
        let { id } = resolvedParams;
        if (!id) {
            return handleApiError({ message: 'Template ID is required.' }, 400);
        }

        let body = await request.json();
        let validation = UpdatePresentationTemplateSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        let template = await prisma.pptxTemplate.update({
            where: { id },
            data: validation.data,
        });

        return createApiResponse(template, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });

// DELETE a presentation template
export const DELETE = withAuth(async ({ params }) => {
    try {
        const resolvedParams = await params;
        let { id } = resolvedParams;
        if (!id) {
            return handleApiError({ message: 'Template ID is required.' }, 400);
        }
        await prisma.pptxTemplate.delete({
            where: { id },
        });
        return createApiResponse({ message: 'Template deleted successfully.' }, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
