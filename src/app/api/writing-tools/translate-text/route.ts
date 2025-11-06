
'use server';

import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { TranslateTextInputSchema } from '@/ai/schemas';
import { translate } from '@vitalets/google-translate-api';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = TranslateTextInputSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const agentInput = validation.data;
    const result = await translate(agentInput.text, { to: 'ar' });


    return createApiResponse(result, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
