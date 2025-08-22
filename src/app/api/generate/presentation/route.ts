
'use server';

import { z } from 'zod';
import { generatePresentation } from '@/ai/flows/generate-presentation';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { ApiGeneratePresentationSchema } from '@/ai/schemas';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = ApiGeneratePresentationSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
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
            templateId: agentInput.templateId
        },
        output: {
            slideCount: result.slides.length
        },
        creditCost: creditCost,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
