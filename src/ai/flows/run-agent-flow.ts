
'use server';

import { ai, getModel } from '@/ai/genkit';
import { z } from 'zod';

const RunAgentInputSchema = z.object({
  systemPrompt: z.string().describe('The overall instruction/persona for the AI agent.'),
  userPrompt: z.string().describe('The user\'s specific request to the agent.'),
  token: z.string().optional(), // Token is for server-side auth, not used in the AI prompt itself
  useOllama: z.boolean().optional().default(false), // Add a flag to explicitly use Ollama
});

export const runAgentFlow = ai.defineFlow(
  {
    name: 'runAgentFlow',
    inputSchema: RunAgentInputSchema,
    outputSchema: z.string(),
  },
  async ({ systemPrompt, userPrompt, useOllama }) => {
    
    // Explicitly choose provider based on the input flag
    const provider = useOllama ? 'ollama' : 'google';

    const llmResponse = await ai.generate({
      model: await getModel('fast', provider), // Pass the selected provider
      prompt: userPrompt,
      system: systemPrompt,
      config: {
        temperature: 0.7,
      },
    });

    return llmResponse.text;
  }
);
