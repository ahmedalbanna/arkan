
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { z } from 'zod';
import { container } from '@/infrastructure/di/container';
import { AIContentController } from '@/modules/ai-content/adapters/controllers/AIContentController';

const SectionSchema = z.object({
  id: z.string().min(3, 'ID must be at least 3 characters'),
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['report', 'diagram', 'presentation']),
  prompt: z.string().optional(),
  guidelines: z.array(z.string()).optional(),
  model: z.string().optional(),
});

export const GET = withAuth(async () => {
  try {
    const controller = container.resolve(AIContentController);
    const sections = await controller.getSections();
    return createApiResponse(sections, 200);
  } catch (error) {
    return handleApiError(error);
  }
});

export const POST = withAuth(async ({ request }) => {
  try {
    const body = await request.json();
    const validation = SectionSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    const controller = container.resolve(AIContentController);
    const result = await controller.saveSection(validation.data);
    return createApiResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
