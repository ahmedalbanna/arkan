// src/app/api/agent-categories/route.ts
import { handleApiError, createApiResponse, withAuth } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { AiController } from '@/modules/ai/adapters/controllers/AiController';

export const GET = withAuth(async () => {
    try {
        const controller = container.resolve(AiController);
        const categories = await controller.getAgentCategories();
        return createApiResponse(categories, 200);
    } catch (error) {
        return handleApiError(error);
    }
});
