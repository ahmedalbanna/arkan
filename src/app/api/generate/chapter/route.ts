
'use server';

import { z } from 'zod';
import { withAuth, handleApiError, handleAiResult } from '@/infrastructure/api/api-utils';
import { GenerateChapterInputSchema } from '@/modules/ai/domain/schemas';
import { container } from '@/infrastructure/di/container';
import { AiController } from '@/modules/ai/adapters/controllers/AiController';

const ChapterGenerationRequestSchema = GenerateChapterInputSchema.extend({
    projectId: z.string().min(1, 'Project ID is required.'),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = ChapterGenerationRequestSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const { projectId: _, ...agentInput } = validation.data;

    // Use the controller to run the tool, which handles credit deduction and logging
    const controller = container.resolve(AiController);
    
    const result = await controller.runTool<any, { content: string }>({
        userId: user.id,
        toolName: 'generate-chapter-content',
        input: agentInput,
    });

    return handleAiResult(result);

  } catch (error) {
    return handleApiError(error);
  }
});
