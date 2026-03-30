
import { withAuth, handleApiError, handleAIContentResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { AIContentController } from '@/modules/ai-content/adapters/controllers/AIContentController';
import { UpdateSectionSchema } from '@/modules/ai-content/domain/schemas/SectionSchema';

export const GET = withAuth(async () => {
  try {
    const controller = container.resolve(AIContentController);
    const result = await controller.getSections();
    return handleAIContentResult(result);
  } catch (error) {
    return handleApiError(error);
  }
});

export const POST = withAuth(async ({ request }) => {
  try {
    const body = await request.json();
    // Use the comprehensive update/create schema for admin actions
    const validation = UpdateSectionSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    const controller = container.resolve(AIContentController);
    const result = await controller.saveSection(validation.data as any);
    return handleAIContentResult(result);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
