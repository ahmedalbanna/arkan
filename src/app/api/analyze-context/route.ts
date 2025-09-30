
'use server';

import { analyzeContext } from '@/ai/flows/analyze-context';
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { deductCredit, logGeneration } from '@/services';
import { z } from 'zod';

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


export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = analyzeContextSchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
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

    return createApiResponseEnhanced(result, 200);

  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});

