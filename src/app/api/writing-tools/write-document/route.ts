
'use server';

import { z } from 'zod';
import { writeDocument } from '@/ai/flows/write-document';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const writeDocumentSchema = z.object({
  topic: z.string().min(5, 'Topic must be at least 5 characters long.'),
  documentType: z.string().min(3, 'Document type is required.'),
  knowledge: z.string().optional(),
  tableOfContents: z.array(z.string()).optional(),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = writeDocumentSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    // This can be a credit-intensive task
    await deductCredit(user.id, 3);
    
    const agentInput = validation.data;
    const result = await writeDocument(agentInput);

    await logGeneration({
        agentId: 'write-document',
        userId: user.id,
        input: agentInput,
        output: { contentLength: result.documentContent.length },
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
