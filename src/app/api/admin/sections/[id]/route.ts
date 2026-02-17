import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';

const SectionUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.enum(['report', 'diagram', 'presentation']).optional(),
  prompt: z.string().optional(),
  guidelines: z.array(z.string()).optional(),
  model: z.string().optional(),
});

// PUT to update a section (Admin only)
export const PUT = withAuth(async ({ request, params }) => {
  try {
    const resolvedParams = await params;
    let sectionId = resolvedParams.id;
    if (!sectionId) {
      return handleApiError({ message: 'Section ID is required' }, 400);
    }
    let body = await request.json();
    let validation = SectionUpdateSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    let section = await prisma.section.update({
      where: { id: sectionId },
      data: validation.data,
    });
    return createApiResponse(section, 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });

// DELETE a section (Admin only)
export const DELETE = withAuth(async ({ params }) => {
  try {
    const resolvedParams = await params;
    let sectionId = resolvedParams.id;
    if (!sectionId) {
      return handleApiError({ message: 'Section ID is required' }, 400);
    }
    await prisma.section.delete({
      where: { id: sectionId },
    });
    return createApiResponse({ message: 'Section deleted successfully' }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
