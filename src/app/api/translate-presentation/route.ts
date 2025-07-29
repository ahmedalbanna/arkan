
'use server';

import { z } from 'zod';
import { translatePresentation } from '@/ai/flows/translate-presentation';
import { deductCredit } from '@/services/credit-service';
import { PresentationHistoryEntrySchema } from '@/ai/schemas';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const translatePresentationSchema = z.object({
  presentation: PresentationHistoryEntrySchema,
  targetLang: z.string().min(2),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = translatePresentationSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }

    await deductCredit(user.id, 2);

    const agentInput = validation.data;
    const result = await translatePresentation(agentInput);

    await logGeneration({
        agentId: 'translate-presentation',
        userId: user.id,
        input: { ...agentInput, presentation: `Presentation ID: ${agentInput.presentation.id}` },
        output: { ...result, presentation: `Presentation ID: ${result.id}` },
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
