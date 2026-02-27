// C:\Users\ahmed\source\repos\arkan\src\app\api\admin\sections\[id]\route.ts
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { z } from 'zod';
import { container } from '@/infrastructure/di/container';
import { AIContentController } from '@/modules/ai-content/adapters/controllers/AIContentController';

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
    const { id: sectionId } = await params;
    if (!sectionId) {
      return handleApiError({ message: 'Section ID is required' }, 400);
    }
    let body = await request.json();
    let validation = SectionUpdateSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const controller = container.resolve(AIContentController);
    const existing = await controller.getSectionById(sectionId);
    if (!existing) {
        return handleApiError({ message: 'Section not found' }, 404);
    }

    const updated = await controller.saveSection({ id: sectionId, ...validation.data });
    return createApiResponse(updated, 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });

// DELETE a section (Admin only)
export const DELETE = withAuth(async ({ params }) => {
  try {
    const { id: sectionId } = await params;
    if (!sectionId) {
      return handleApiError({ message: 'Section ID is required' }, 400);
    }
    
    const controller = container.resolve(AIContentController);
    await controller.deleteSection(sectionId);
    
    return createApiResponse({ message: 'Section deleted successfully' }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
