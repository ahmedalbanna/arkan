
'use server';

import { analyzeAcademicDocument } from '@/ai/flows/academic-solver';
import { ApiAnalyzeSchema } from '@/ai/schemas';
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { deductCredit, logGeneration } from '@/services';

export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = ApiAnalyzeSchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
    }

    const agentInput = {
      documentType: validation.data.documentType,
      markdownContent: validation.data.markdown,
    };
    const result = await analyzeAcademicDocument(agentInput);

    // Deduct credit only after a successful generation
    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    await logGeneration({
      agentId: `analyze-${validation.data.documentType}`,
      userId: user.id,
      input: agentInput,
      output: result,
      creditCost: creditCost,
    });

    return createApiResponseEnhanced(result, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
