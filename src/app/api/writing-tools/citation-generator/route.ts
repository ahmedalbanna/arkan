
'use server';

import { z } from 'zod';
import { generateCitation, CitationStyleSchema } from '@/ai/flows/generate-citation';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const citationSchema = z.object({
  sourceText: z.string().min(10, 'Source material must be at least 10 characters long.'),
  style: CitationStyleSchema,
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = citationSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    await deductCredit(user.id, 1);
    
    const agentInput = validation.data;
    const result = await generateCitation(agentInput);

    await logGeneration({
        agentId: 'generate-citation',
        userId: user.id,
        input: agentInput,
        output: result,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
