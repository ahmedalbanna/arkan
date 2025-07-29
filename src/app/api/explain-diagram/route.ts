
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

    await deductCredit(user.id, 1);

    const agentInput = validation.data;
    const result = await explainDiagram(agentInput);

    await logGeneration({
      agentId: 'explain-diagram',
      userId: user.id,
      input: { summary: "Diagram Image" }, // Don't log the full data URI
      output: result,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
