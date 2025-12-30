'use server';

import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const schema = z.object({ fullPrompt: z.string() });

export const POST = withAuth(async ({ request }) => {
  try {
    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const llmResponse = await ai.generate({ 
      model: 'googleai/gemini-2.5-flash-lite', 
      prompt: validation.data.fullPrompt 
    });
    
    return createApiResponse({ text: llmResponse.text }, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
