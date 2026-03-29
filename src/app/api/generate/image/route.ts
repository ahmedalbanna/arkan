
'use server';

import { z } from 'zod';
import { withAuth, handleApiError, handleAiResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { AiController } from '@/modules/ai/adapters/controllers/AiController';

const generateImageSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters long."),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = generateImageSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const controller = container.resolve(AiController);
    const result = await controller.runTool<any, any>({
        userId: user.id,
        toolName: 'generate-image',
        input: validation.data,
    });

    return handleAiResult(result);
  } catch (error) {
    return handleApiError(error);
  }
});
