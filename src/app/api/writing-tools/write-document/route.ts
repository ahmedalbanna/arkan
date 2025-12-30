'use server';

import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { writeDocument } from '@/ai/flows/write-document';
import { WriteDocumentInputSchema } from '@/ai/schemas';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = WriteDocumentInputSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const result = await writeDocument(validation.data);
    
    await deductCredit(user.id, 3);

    await logGeneration({
      agentId: 'write-document',
      userId: user.id,
      input: validation.data,
      output: result,
      creditCost: 3,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
