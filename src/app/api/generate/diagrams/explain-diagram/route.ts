
'use server';

import { z } from 'zod';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { explainDiagram } from '@/ai/flows/explain-diagram';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const explainDiagramSchema = z.object({
  imageDataUri: z.string().startsWith('data:image/'),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = explainDiagramSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const agentInput = validation.data;
    const result = await explainDiagram(agentInput);

    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    await logGeneration({
      agentId: 'explain-diagram',
      userId: user.id,
      input: { summary: "Diagram Image" }, // Don't log the full data URI
      output: result,
      creditCost: creditCost,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
