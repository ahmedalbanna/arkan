'use server';

import { TranslateTextInputSchema } from '@/ai/schemas';
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { translate } from '@vitalets/google-translate-api';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = TranslateTextInputSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const agentInput = validation.data;
    const result = await translate(agentInput.text, { to: agentInput.targetLang });


    return createApiResponse(result, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
