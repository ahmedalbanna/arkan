
import { handleApiError, withAuth, handleAiResult } from '@/infrastructure/api/api-utils';
import { z } from 'zod';
import { container } from '@/infrastructure/di/container';
import { AiController } from '@/modules/ai/adapters/controllers/AiController';

const agentUpdateSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    prompt: z.string().optional(),
    guidelines: z.array(z.string()).optional(),
    isEnabled: z.boolean().optional(),
    author: z.string().optional(),
    version: z.string().optional(),
});

export const GET = withAuth(async ({ params }) => {
    try {
        const { id } = await params;
        const controller = container.resolve(AiController);
        const result = await controller.getAgentById(id);

        return handleAiResult(result);
    } catch (error) {
        return handleApiError(error);
    }
});

export const PUT = withAuth(async ({ request, params }) => {
    try {
        const { id } = await params;
        const body = await request.json();
        const validation = agentUpdateSchema.safeParse(body);

        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const controller = container.resolve(AiController);
        const result = await controller.saveAgent(id, validation.data);
        
        return handleAiResult(result);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });

export const DELETE = withAuth(async ({ params }) => {
    try {
        const { id } = await params;
        const controller = container.resolve(AiController);
        const result = await controller.deleteAgent(id);
        
        return handleAiResult(result);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
