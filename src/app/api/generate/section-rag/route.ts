
'use server';

import { z } from 'zod';
import { withAuth, handleApiError, handleAiResult } from '@/infrastructure/api/api-utils';
import { GenerateSectionInputSchema } from '@/modules/ai/domain/schemas';
import { container } from '@/infrastructure/di/container';
import { AiController } from '@/modules/ai/adapters/controllers/AiController';

const SectionRAGRequestSchema = GenerateSectionInputSchema.extend({
    projectId: z.string().min(1, 'Project ID is required.'),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = SectionRAGRequestSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const { ...agentInput } = validation.data;

    // Use the controller to run the RAG-enhanced generation, which uses the specialized use-case
    const controller = container.resolve(AiController);
    
    const result = await controller.generateSectionWithRAG(user.id, agentInput);

    return handleAiResult(result);

  } catch (error) {
    return handleApiError(error);
  }
});
