'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RunAgentInputSchema = z.object({
  systemPrompt: z.string().describe('The overall instruction/persona for the AI agent.'),
  userPrompt: z.string().describe('The user\'s specific request to the agent.'),
});

export const runAgentFlow = ai.defineFlow(
  {
    name: 'runAgentFlow',
    inputSchema: RunAgentInputSchema,
    outputSchema: z.string(),
  },
  async ({ systemPrompt, userPrompt }) => {
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash-lite',
      prompt: userPrompt,
      system: systemPrompt,
      config: {
        temperature: 0.7,
      },
    });

    return llmResponse.text;
  }
);
