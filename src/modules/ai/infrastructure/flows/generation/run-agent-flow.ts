'use server';

import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import { z } from 'zod';

const RunAgentInputSchema = z.object({
  systemPrompt: z.string().describe('The overall instruction/persona for the AI agent.'),
  userPrompt: z.string().describe('The user\'s specific request to the agent.'),
  token: z.string().optional(), // Token is for server-side auth, not used in the AI prompt itself
});

export const runAgentFlow = ai.defineFlow(
  {
    name: 'runAgentFlow',
    inputSchema: RunAgentInputSchema,
    outputSchema: z.string(),
  },
  async ({ systemPrompt, userPrompt }) => {
    const llmResponse = await ai.generate({

      prompt: userPrompt,
      system: systemPrompt,
      config: {
        temperature: 0.7,
      },
    });

    return llmResponse.text;
  }
);
