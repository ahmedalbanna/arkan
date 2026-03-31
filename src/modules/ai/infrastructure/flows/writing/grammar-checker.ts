
'use server';

/**
 * @fileOverview An AI agent for checking grammar and providing explanations.
 */

import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import { GrammarCheckInputSchema, GrammarCheckOutputSchema, type GrammarCheckInput, type GrammarCheckOutput } from '@/modules/ai/domain/schemas';

const grammarCheckPrompt = ai.definePrompt({
  name: 'grammarCheckPrompt',
  input: { schema: GrammarCheckInputSchema },
  model: 'ollama/gemma:2b',
  prompt: `You are an expert English grammar, spelling, and punctuation checker. Your task is to analyze the text and correct any errors.

**Original Text:**
---
{{{text}}}
---

Output ONLY the fully corrected version of the text. Preserve all markdown formatting. Do NOT include any preamble, filler, or JSON wrapping.`,
  config: {
    temperature: 0.1, // Very low temp for accuracy
  }
});

const grammarCheckFlow = ai.defineFlow({
  name: 'grammarCheckFlow',
  inputSchema: GrammarCheckInputSchema,
  outputSchema: GrammarCheckOutputSchema,
}, async (input: GrammarCheckInput) => {
  const result = await grammarCheckPrompt(input);
  const text = result.text || result.output || "";
  if (!text) {
    throw new Error("Grammar check failed.");
  }

  return text.trim();
});

export async function grammarCheck(input: GrammarCheckInput): Promise<GrammarCheckOutput> {
  const validation = GrammarCheckInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for grammarCheck: ${validation.error.message}`);
  }
  return grammarCheckFlow(validation.data);
}
