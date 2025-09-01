'use server';

import { z } from 'zod';
import { generatePlantUML } from '@/ai/flows/generate-plantuml';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { DiagramTypeSchema } from '@/ai/schemas';

const generatePlantUMLApiSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  diagramType: DiagramTypeSchema,
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = generatePlantUMLApiSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const agentInput = validation.data;
    const result = await generatePlantUML(agentInput);

    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    await logGeneration({
        agentId: 'generate-plantuml',
        userId: user.id,
        input: agentInput,
        output: { characters: result.plantUmlCode.length },
        creditCost: creditCost,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
