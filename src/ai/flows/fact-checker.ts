'use server';

/**
 * @fileOverview An AI agent for fact-checking claims within a text.
 */

import { ai } from '@/ai/genkit';
import { FactCheckInputSchema, FactCheckOutputSchema, type FactCheckInput, type FactCheckOutput } from '@/ai/schemas';
import { factCheckPrompt } from '../prompts/fact-checker';



const factCheckFlow = ai.defineFlow({
  name: 'factCheckFlow',
  inputSchema: FactCheckInputSchema,
  outputSchema: FactCheckOutputSchema,
}, async (input) => {
  const { output } = await factCheckPrompt(input);
  if (!output) {
    throw new Error("Fact-checking failed to produce an output.");
  }
  return output;
});

export async function factCheckText(input: FactCheckInput): Promise<FactCheckOutput> {
  const validation = FactCheckInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for factCheckText: ${validation.error.message}`);
  }
  return factCheckFlow(validation.data);
}
