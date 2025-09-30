
'use server';

import { generatePresentation } from '@/ai/flows/generate-presentation';
import { ApiGeneratePresentationSchema } from '@/ai/schemas';
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

const generatePresentationApiSchema = ApiGeneratePresentationSchema;


export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = generatePresentationApiSchema.safeParse(body);

    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
    }

    const agentInput = validation.data;
    const result = await generatePresentation(agentInput);

    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    await logGeneration({
      agentId: 'generate-presentation',
      userId: user.id,
      input: {
        guidelineCount: agentInput.guidelines?.length || 0,
        sourceDocumentCount: agentInput.sourceDocuments.length,
      },
      output: {
        slideCount: result.slides.length
      },
      creditCost: creditCost,
    });

    return createApiResponseEnhanced(result, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});


