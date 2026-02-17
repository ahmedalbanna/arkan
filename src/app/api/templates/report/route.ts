// src/app/api/templates/report/route.ts
import { getReportTemplates, createReportTemplate } from '@/services/templateService';
import { CreateReportTemplateSchema, type ReportTemplateProperties } from '@/lib/models';
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { defaultReportTemplates } from '@/lib/db/seed-data/report-templates';

/**
 * GET /api/templates/report
 * This is a public endpoint that does not require authentication
 * as all users need to be able to fetch the templates for building reports.
 */
export async function GET() {
  try {
    let templates = await getReportTemplates();

    // Lazy seeding: If no templates exist, populate them from the default config.
    if (templates.length === 0) {
      for (const template of defaultReportTemplates) {
        await createReportTemplate({
          id: template.id,
          name: template.name,
          description: template.description || '',
          content: template.content,
          imageUrl: template.imageUrl,
        });
      }

      // Re-fetch after seeding
      templates = await getReportTemplates();
    }

    const response = templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      content: t.content,
      imageUrl: t.imageUrl,
      createdAt: t.createdAt.toISOString(),
    }));

    return createApiResponse(response, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/templates/report
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
