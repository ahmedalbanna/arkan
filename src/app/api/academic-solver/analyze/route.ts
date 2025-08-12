
'use server';

import { z } from 'zod';
import { deductCredit } from '@/services/credit-service';
import { analyzeAcademicDocument } from '@/ai/flows/academic-solver';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { ApiAnalyzeSchema } from '@/ai/schemas';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = ApiAnalyzeSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const agentInput = {
      documentType: validation.data.documentType,
      markdownContent: validation.data.markdown,
    };
    const result = await analyzeAcademicDocument(agentInput);

    // Deduct credit only after a successful generation
    await deductCredit(user.id, 1);

    await logGeneration({
        agentId: `analyze-${validation.data.documentType}`,
        userId: user.id,
        input: agentInput,
        output: result,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
