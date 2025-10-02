
'use server';

import { solveAcademicDocument } from '@/ai/flows/academic-solver';
import { ApiSolveSchema } from '@/ai/schemas';
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { deductCredit, logGeneration } from '@/services';

export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = ApiSolveSchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
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

    return createApiResponseEnhanced(result, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
