
'use server';

import { z } from 'zod';
import { deductCredit } from '@/services/credit-service';
import { solveAcademicDocument } from '@/ai/flows/academic-solver';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { ApiSolveSchema } from '@/ai/schemas';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = ApiSolveSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const { analyzedDocument, contextMarkdown } = validation.data;
    
    // Deduct credit before the AI call
    const creditCost = analyzedDocument.documentType === 'exam' ? 3 : 2;
    await deductCredit(user.id, creditCost);

    const result = await solveAcademicDocument({
      analyzedDocument,
      contextMarkdown
    });

    await logGeneration({
        agentId: `solve-${analyzedDocument.documentType}`,
        userId: user.id,
        input: { analyzedDocument, contextMarkdown: !!contextMarkdown },
        output: result,
        creditCost: creditCost,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
