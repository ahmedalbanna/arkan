
'use server';

import { z } from 'zod';
import { deductCredit } from '@/services/credit-service';
import { generateImage } from '@/ai/flows/generate-image';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const generateImageSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters long."),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = generateImageSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    // Deduct credit for image generation
    await deductCredit(user.id, 5);

    const result = await generateImage(validation.data);

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
