
'use server';

import { z } from 'zod';
import { manipulateText } from '@/ai/flows/manipulate-text';
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

    await deductCredit(user.id, 1);

    const agentInput = {
        textToManipulate: validation.data.text,
        command: 'Correct any grammar and spelling mistakes in this text. Preserve the original markdown formatting.'
    };
    
    const result = await manipulateText(agentInput);

    await logGeneration({
        agentId: 'grammar-checker',
        userId: user.id,
        input: { textLength: validation.data.text.length },
        output: { rewrittenLength: result.rewrittenText.length },
    });

    return createApiResponse(result, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
