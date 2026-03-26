
'use server';

import { z } from 'zod';
import { generateImage } from '@/ai/flows/generate-image';
import { withAuth, handleApiError, createApiResponse } from '@/infrastructure/api/api-utils';
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
    const result = await controller.runTool<typeof validation.data & { flow: 'generate-image' }, Awaited<ReturnType<typeof generateImage>>>({
        userId: user.id,
        toolName: 'generate-image',
        input: { ...validation.data, flow: 'generate-image' as const },
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
