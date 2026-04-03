// src/app/api/agent-categories/route.ts
import { handleApiError, handleAiResult, withAuth } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { AiController } from '@/modules/ai/adapters/controllers/AiController';

export const GET = withAuth(async () => {
    try {
        const controller = container.resolve(AiController);
        const result = await controller.getAgentCategories();
        return handleAiResult(result);
    } catch (error) {
        return handleApiError(error);
    }
});
