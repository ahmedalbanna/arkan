
'use server';

import { z } from 'zod';
import { deductCredit } from '@/services/credit-service';
import { solveAcademicDocument } from '@/ai/flows/academic-solver';
import { AnalyzedDocumentSchema } from '@/ai/flows/academic-solver.shared';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const solveSchema = z.object({
  analyzedDocument: AnalyzedDocumentSchema,
  contextMarkdown: z.string().optional(),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = solveSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const { documentType } = validation.data.analyzedDocument;
    const creditCost = documentType === 'exam' ? 3 : 2;
    await deductCredit(user.id, creditCost);
    
    const { analyzedDocument, contextMarkdown } = validation.data;
    
    const result = await solveAcademicDocument({
      analyzedDocument,
      contextMarkdown
    });

    await logGeneration({
        agentId: `solve-${documentType}`,
        userId: user.id,
        input: { analyzedDocument, contextMarkdown: !!contextMarkdown },
        output: result,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
