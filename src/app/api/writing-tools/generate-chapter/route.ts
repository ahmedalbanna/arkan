
'use server';

import { GenerateChapterInputSchema } from '@/ai/schemas/flows';
import { generateChapterContent } from '@/ai/flows/generate-chapter-content';
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

export const POST = withAuth(async ({ request, user }) => {
  try {
    let body = await request.json();
    // Use the base schema without the 'flow' literal for validation
    let validation = GenerateChapterInputSchema.omit({ flow: true }).safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    // Add the flow property back for the AI flow call
    const agentInput = { ...validation.data, flow: 'generate-chapter' as const };

    const result = await generateChapterContent(agentInput);

    // Deduct credits based on the number of sections being generated
    const creditCost = agentInput.sectionInstructions.length;
    await deductCredit(user.id, creditCost);

    await logGeneration({
        agentId: 'generate-chapter-content',
        userId: user.id,
        input: { chapterTitle: agentInput.chapterTitle, sectionCount: agentInput.sectionInstructions.length },
        output: { characterCount: result.markdownContent.length },
        creditCost: creditCost,
    });

    return createApiResponse(result, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
