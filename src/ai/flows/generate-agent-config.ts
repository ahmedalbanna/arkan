
'use server';

import { ai } from '@/ai/genkit';
import { generateAgentConfigPrompt } from '@/ai/prompts/generate-agent-config';
import { GenerateAgentConfigInputSchema, GenerateAgentConfigOutputSchema, type GenerateAgentConfigOutput } from '@/ai/schemas';
import { z } from 'zod';

const generateAgentConfigFlow = ai.defineFlow({
  name: 'generateAgentConfigFlow',
  inputSchema: GenerateAgentConfigInputSchema,
  outputSchema: GenerateAgentConfigOutputSchema
}, async (input) => {
  const { output } = await generateAgentConfigPrompt(input);
  if (!output) {
    throw new Error("Agent configuration generation failed.");
  }
  return output;
});


export async function generateAgentConfig(input: z.infer<typeof GenerateAgentConfigInputSchema>): Promise<GenerateAgentConfigOutput> {
  const validation = GenerateAgentConfigInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for generateAgentConfig: ${validation.error.message}`);
  }
  return generateAgentConfigFlow(validation.data);
}
