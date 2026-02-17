
'use server';

import { z } from 'zod';
import { deductCredit } from '@/services/credit-service';
import { generateImage } from '@/ai/flows/generate-image';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { logGeneration } from '@/services/generation-service';

const generateImageSchema = z.object({
  flow: z.literal('generate-image'),
  prompt: z.string().min(3, "Prompt must be at least 3 characters long."),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = generateImageSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const result = await generateImage({prompt: validation.data.prompt, flow: 'generate-image'});

    const creditCost = 5;
    await deductCredit(user.id, creditCost);

    await logGeneration({
        agentId: 'generate-image',
        userId: user.id,
        input: validation.data,
        output: { imageUrl: `data:image/...;base64,...[TRUNCATED]` },
        creditCost: creditCost
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
