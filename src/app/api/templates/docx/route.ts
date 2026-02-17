// src/app/api/templates/docx/route.ts
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { getDocxTemplates, createDocxTemplate } from '@/services/templateService';
import { templates as defaultTemplates, type DocxTemplateKey } from '@/lib/docx-styles';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/templates/docx
 * This endpoint is public and returns all DOCX templates.
 * If no templates exist, it seeds them from default config.
 */
export async function GET() {
  try {
    let templates = await getDocxTemplates();

    // Lazy seeding: If no templates exist, populate them from the default config.
    if (templates.length === 0) {
      const templateEntries = Object.entries(defaultTemplates) as Array<[DocxTemplateKey, typeof defaultTemplates[DocxTemplateKey]]>;
      
      for (const [key, template] of templateEntries) {
        await createDocxTemplate({
          id: key,
          name: template.name || key,
          description: template.description || `${key} template`,
          styles: template.styles || {},
          imageUrl: template.imageUrl,
          dataAiHint: template.dataAiHint,
        });
      }

      // Re-fetch after seeding
      templates = await getDocxTemplates();
    }

    // Convert to response format
    const response = Object.fromEntries(
      templates.map((t) => [
        t.id,
        {
          id: t.id,
          name: t.name,
          description: t.description,
          styles: t.styles,
          imageUrl: t.imageUrl,
          dataAiHint: t.dataAiHint,
          createdAt: t.createdAt.toISOString(),
        },
      ])
    );

    return createApiResponse(response, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

const createDocxTemplateSchema = z.object({
  id: z
    .string()
    .min(3, 'ID must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'ID can only contain lowercase letters, numbers, and hyphens.'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
});

/**
 * POST /api/templates/docx
 * Admin-only endpoint to create a new DOCX template
 */
export const POST = withAuth(
  async ({ request }) => {
    try {
      const body = await request.json();
      const validation = createDocxTemplateSchema.safeParse(body);

      if (!validation.success) {
        return handleApiError(validation.error);
      }

      const { id, name, description } = validation.data;

      // Create a new template based on the 'modern' default
      const newTemplateData = {
        id,
        name,
        description,
        styles: defaultTemplates.modern.styles,
        imageUrl: 'https://placehold.co/400x565.png',
        dataAiHint: 'document modern',
      };

      const newTemplate = await createDocxTemplate(newTemplateData);

      return createApiResponse(
        {
          id: newTemplate.id,
          name: newTemplate.name,
          description: newTemplate.description,
          styles: newTemplate.styles,
          imageUrl: newTemplate.imageUrl,
          dataAiHint: newTemplate.dataAiHint,
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
