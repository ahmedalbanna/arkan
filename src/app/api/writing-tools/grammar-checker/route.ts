
'use server';

import { z } from 'zod';
import { grammarCheck } from '@/ai/flows/grammar-checker';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const grammarCheckSchema = z.object({
  text: z.string().min(5, 'Text must be at least 5 characters to check.'),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = grammarCheckSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const agentInput = {
        text: validation.data.text,
    };
    
    const result = await grammarCheck(agentInput);
    
    // Deduct credit only after a successful generation
    await deductCredit(user.id, 1);

    await logGeneration({
        agentId: 'grammar-checker',
        userId: user.id,
        input: { textLength: validation.data.text.length },
        output: { 
            correctedLength: result.correctedText.length,
            correctionsCount: result.corrections.length,
        },
    });

    return createApiResponse(result, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
