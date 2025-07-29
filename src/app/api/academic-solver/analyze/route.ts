
'use server';

import { z } from 'zod';
import { deductCredit } from '@/services/credit-service';
import { analyzeAcademicDocument } from '@/ai/flows/academic-solver';
import { logGeneration } from '@/services/generation-service';
import { AcademicDocumentTypeSchema } from '@/ai/flows/academic-solver.shared';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const analyzeSchema = z.object({
  documentType: AcademicDocumentTypeSchema,
  markdown: z.string().min(20, 'Markdown content is too short.'),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = analyzeSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    await deductCredit(user.id, 1);
    
    const agentInput = {
      documentType: validation.data.documentType,
      markdownContent: validation.data.markdown,
    };
    const result = await analyzeAcademicDocument(agentInput);

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
