
'use server';

import { z } from 'zod';
import { generateReportSection } from '@/ai/flows/generate-report-section';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { GenerateSectionInputSchema } from '@/ai/schemas';
import { executeWithQueue, generateRequestId, selectModel } from '@/ai';
import { container } from '@/infrastructure/di/container';
import { AiController } from '@/modules/ai/adapters/controllers/AiController';

const SectionGenerationRequestSchema = GenerateSectionInputSchema.extend({
    projectId: z.string().min(1, 'Project ID is required.'),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = SectionGenerationRequestSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const { projectId: _, ...agentInput } = validation.data;
    const creditCost = 1;

    // Use the controller to run the tool, which handles credit deduction and logging
    const controller = container.resolve(AiController);
    
    const result = await controller.runTool({
        userId: user.id,
        toolName: agentInput.sectionToGenerate,
        input: agentInput,
        flow: async (input) => {
            const model = selectModel({ flowName: 'generate-report-section' });
            return executeWithQueue(
                generateRequestId(),
                model,
                'generate-report-section',
                () => generateReportSection(input)
            );
        },
        creditCost
    });

    const sectionResult = result as { content?: string } | null;
    const content = sectionResult?.content;
    if (!content) {
      throw new Error('AI generation returned empty content.');
    }

    return createApiResponse({ content }, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
