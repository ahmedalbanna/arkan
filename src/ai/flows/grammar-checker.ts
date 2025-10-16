
'use server';

/**
 * @fileOverview An AI agent for checking grammar and providing explanations.
 */

import { ai } from '@/ai/genkit';
import { grammarCheckPrompt } from '@/ai/prompts/grammar-checker';
import { GrammarCheckInputSchema, GrammarCheckOutputSchema, type GrammarCheckInput, type GrammarCheckOutput } from '@/ai/schemas';

const grammarCheckFlow = ai.defineFlow({
  name: 'grammarCheckFlow',
  inputSchema: GrammarCheckInputSchema,
  outputSchema: GrammarCheckOutputSchema,
}, async (input) => {
  const { output } = await grammarCheckPrompt(input);
  if (!output) {
    throw new Error("Grammar check failed.");
  }
  return output;
});

export async function grammarCheck(input: GrammarCheckInput): Promise<GrammarCheckOutput> {
  const validation = GrammarCheckInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for grammarCheck: ${validation.error.message}`);
  }
  return grammarCheckFlow(validation.data);
}
