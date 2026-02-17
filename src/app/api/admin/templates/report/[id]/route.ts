import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import prisma from '@/lib/db/prisma';
import { UpdateReportTemplateSchema } from '@/ai/schemas';

// GET a single report template
export const GET = withAuth(async ({ params }) => {
    try {
        const resolvedParams = await params;
        let { id } = resolvedParams;
        if (!id) {
            return handleApiError({ message: 'Template ID is required.' }, 400);
        }
        let template = await prisma.reportTemplate.findUnique({
            where: { id },
        });

        if (!template) {
            return handleApiError({ message: 'Report template not found.' }, 404);
        }
        return createApiResponse(template, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });

// PUT to update a report template
export const PUT = withAuth(async ({ request, params }) => {
    try {
        const resolvedParams = await params;
        let { id } = resolvedParams;
        if (!id) {
            return handleApiError({ message: 'Template ID is required.' }, 400);
        }

        let body = await request.json();
        let validation = UpdateReportTemplateSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        let template = await prisma.reportTemplate.update({
            where: { id },
            data: validation.data,
        });

        return createApiResponse(template, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });

// DELETE a report template
export const DELETE = withAuth(async ({ params }) => {
    try {
        const resolvedParams = await params;
        let { id } = resolvedParams;
        if (!id) {
            return handleApiError({ message: 'Template ID is required.' }, 400);
        }
        await prisma.reportTemplate.delete({
            where: { id },
        });
        return createApiResponse({ message: 'Template deleted successfully.' }, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
