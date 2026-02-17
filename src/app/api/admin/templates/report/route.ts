// src/app/api/admin/templates/report/route.ts
import { CreateReportTemplateSchema } from '@/ai/schemas';
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { createReportTemplate } from '@/services/templateService';

/**
 * POST /api/admin/templates/report
 * Admin-only endpoint to create a new report template
 */
export const POST = withAuth(
  async ({ request }) => {
    try {
      const body = await request.json();
      const validation = CreateReportTemplateSchema.safeParse(body);
      
      if (!validation.success) {
        return handleApiError(validation.error);
      }

      const { id, name, description, content, imageUrl } = validation.data;

      const newTemplate = await createReportTemplate({
        id,
        name,
        description,
        content,
        imageUrl,
      });

      return createApiResponse(
        {
          id: newTemplate.id,
          name: newTemplate.name,
          description: newTemplate.description,
          content: newTemplate.content,
          imageUrl: newTemplate.imageUrl,
          createdAt: newTemplate.createdAt.toISOString(),
        },
        201
      );
    } catch (error) {
      return handleApiError(error);
    }
  },
  { requireAdmin: true }
);
