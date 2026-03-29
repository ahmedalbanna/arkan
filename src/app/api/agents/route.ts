
import { handleApiError, withAuth, handleAiResult } from '@/infrastructure/api/api-utils';
import { z } from 'zod';
import { container } from '@/infrastructure/di/container';
import { AiController } from '@/modules/ai/adapters/controllers/AiController';
import { AiError } from '@/modules/ai/domain/errors/AiErrors';
import { Result } from '@/infrastructure/utils/result';

const agentSchema = z.object({
    id: z.string().min(3).regex(/^[a-z0-9-]+$/, "ID must be lowercase alphanumeric with hyphens"),
    name: z.string().min(1),
    description: z.string().optional(),
    category: z.string().min(1),
    prompt: z.string().optional(),
    guidelines: z.array(z.string()).optional(),
    isEnabled: z.boolean().default(true),
    author: z.string().default('Custom'),
    version: z.string().default('1.0'),
});

export const GET = withAuth(async ({ request }) => {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || undefined;
        const enabledOnly = searchParams.get('enabledOnly') !== 'false';

        const controller = container.resolve(AiController);
        const result = await controller.getAgents({ category, enabledOnly });

        return handleAiResult(result);
    } catch (error) {
        return handleApiError(error);
    }
});

export const POST = withAuth(async ({ request }) => {
    try {
        const body = await request.json();
        const validation = agentSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const { id, ...agentData } = validation.data;
        const controller = container.resolve(AiController);
        
        // Check if exists
        const existingResult = await controller.getAgentById(id);
        if (existingResult.isSuccess && existingResult.getValue()) {
            return handleAiResult(Result.fail(AiError.conflict('Agent with this ID already exists.')));
        }

        const result = await controller.saveAgent(id, agentData);
        return handleAiResult(result);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
