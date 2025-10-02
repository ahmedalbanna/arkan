
'use server';

import { generateImage } from '@/ai/flows/generate-image';
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { deductCredit, logGeneration } from '@/services';
import { z } from 'zod';

// Schema لتوليد الصور
const generateImageSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters long."),
});

/**
 * معالج توليد الصور
 */
export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = generateImageSchema.safeParse(body);

    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
    }

    const result = await generateImage(validation.data);

    const creditCost = 5;
    await deductCredit(user.id, creditCost);

    await logGeneration({
      agentId: 'generate-image',
      userId: user.id,
      input: validation.data,
      output: { imageUrl: `data:image/...;base64,...[TRUNCATED]` },
      creditCost: creditCost
    });

    return createApiResponseEnhanced(result, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
