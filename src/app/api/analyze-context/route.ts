
'use server';

import { z } from 'zod';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { analyzeContext } from '@/ai/flows/analyze-context';
import { imageToText } from '@/ai/flows/image-to-text';
import { rewriteDocumentToMarkdown } from '@/ai/flows/rewrite-document-to-markdown';

// Define the schema for a single file in the request
const FileContextSchema = z.object({
  fileName: z.string(),
  content: z.string(), // This will now always be markdown or plain text
  type: z.enum(['context', 'example', 'question', 'textbook', 'guidelines']),
});

// Define the main schema for the API request
const analyzeContextSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters long.'),
  contextFiles: z.array(FileContextSchema),
});


export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = analyzeContextSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const agentInput = validation.data;
    const result = await analyzeContext(agentInput);

    // This is a complex task, so we deduct 2 credits.
    const creditCost = 2;
    await deductCredit(user.id, creditCost);

    await logGeneration({
        agentId: 'analyze-context',
        userId: user.id,
        input: {
            prompt: agentInput.prompt,
            fileCount: agentInput.contextFiles.length
        },
        output: {
            schema: "[...Zod Schema...]",
            data: "[...JSON Data...]"
        },
        creditCost: creditCost,
    });

    return createApiResponse(result, 200);

  } catch (error) {
    return handleApiError(error);
  }
});

