
'use server';

import { z } from 'zod';
import { improveReportMarkdown } from '@/ai/flows/improve-report-markdown';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const improveMarkdownSchema = z.object({
  markdownContent: z.string().min(20, 'Markdown content is too short.'),
  userPrompt: z.string().min(10, 'Instructions for the AI must be at least 10 characters.'),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = improveMarkdownSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    await deductCredit(user.id, 1);
    
    const { markdownContent, userPrompt } = validation.data;
    const result = await improveReportMarkdown({ markdownContent, userPrompt });

    await logGeneration({
        agentId: 'improve-report-markdown',
        userId: user.id,
        input: { markdownLength: markdownContent.length, prompt: userPrompt },
        output: { improvedMarkdownLength: result.improvedMarkdown.length },
    });

    return createApiResponse(result, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
