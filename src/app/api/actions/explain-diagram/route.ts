'use server';

import { z } from 'zod';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { imageToText } from '@/ai/flows/image-to-text';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';


const explainDiagramSchema = z.object({
  imageDataUri: z.string().startsWith('data:image', "Must be a valid image data URI."),
  prompt: z.string().min(1, 'Prompt cannot be empty.'),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    let body = await request.json();
    let validation = explainDiagramSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    // Call the image-to-text flow which is more generic
    let result = await imageToText(validation.data);

    // Deduct credit for the action
    await deductCredit(user.id, 1);

    await logGeneration({
      agentId: 'explain-diagram',
      userId: user.id,
      input: { prompt: body.prompt },
      output: result,
      creditCost: 1,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
