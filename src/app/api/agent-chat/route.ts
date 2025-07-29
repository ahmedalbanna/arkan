
'use server';

import { z } from 'zod';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { agentChat } from '@/ai/flows/agent-chat';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const chatSchema = z.object({
  agentId: z.string(),
  message: z.string(),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = chatSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    await deductCredit(user.id, 1);

    const agentInput = validation.data;
    const result = await agentChat(agentInput);

    await logGeneration({
      agentId: validation.data.agentId,
      userId: user.id,
      input: { message: validation.data.message },
      output: result,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
