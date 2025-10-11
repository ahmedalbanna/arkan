
'use server';

/**
 * @fileOverview An AI agent for generating academic citations.
 */

import { ai } from '@/ai/genkit';
import { generateCitationPrompt } from '@/ai/prompts/generate-citation';
import { GenerateCitationInputSchema, GenerateCitationOutputSchema, type GenerateCitationInput, type GenerateCitationOutput } from '@/ai/schemas';

const generateCitationFlow = ai.defineFlow({
  name: 'generateCitationFlow',
  inputSchema: GenerateCitationInputSchema,
  outputSchema: GenerateCitationOutputSchema,
}, async (input) => {
  const { output } = await generateCitationPrompt(input);
  if (!output) {
    throw new Error("Citation generation failed.");
  }
  return output;
});

export async function generateCitation(input: GenerateCitationInput): Promise<GenerateCitationOutput> {
  const validation = GenerateCitationInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for generateCitation: ${validation.error.message}`);
  }
  return generateCitationFlow(validation.data);
}
