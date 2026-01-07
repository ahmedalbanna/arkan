
'use server';

/**
 * @fileOverview An AI agent for analyzing the sentence structure of a text.
 */

import { ai } from '@/ai/genkit';
import { SentenceStructureCheckInputSchema, SentenceStructureCheckOutputSchema, type SentenceStructureCheckInput, type SentenceStructureCheckOutput } from '@/lib/schemas';

const sentenceStructureCheckPrompt = ai.definePrompt({
  name: 'sentenceStructureCheckPrompt',
  input: { schema: SentenceStructureCheckInputSchema },
  output: { schema: SentenceStructureCheckOutputSchema },
  model: 'googleai/gemini-2.5-flash-lite',
  prompt: `You are an expert writing analyst. Your task is to analyze the provided text for its sentence structure.

**Analysis Process:**
1.  **Calculate Statistics:**
    *   Count the total number of sentences.
    *   Calculate the average sentence length in words.
    *   Identify the shortest and longest sentences.
2.  **Analyze Variety:**
    *   Assess the variation in sentence length (e.g., 'low', 'medium', 'high').
    *   Assess the variation in sentence structure (e.g., simple, compound, complex).
3.  **Identify Issues:**
    *   Pinpoint specific long, rambling, or convoluted sentences that could be simplified.
    *   Identify areas with too many short, choppy sentences.
4.  **Provide Suggestions:**
    *   Give specific, actionable suggestions for improving sentence flow and readability.
    *   Offer examples of how to rewrite problematic sentences.
5.  **Overall Assessment:** Provide a brief, overall assessment of the text's sentence structure.

**Text to Analyze:**
---
{{{text}}}
---
`,
});

const sentenceStructureCheckFlow = ai.defineFlow({
  name: 'sentenceStructureCheckFlow',
  inputSchema: SentenceStructureCheckInputSchema,
  outputSchema: SentenceStructureCheckOutputSchema,
}, async (input) => {
  const { output } = await sentenceStructureCheckPrompt(input);
  if (!output) {
    throw new Error('Sentence structure check failed to produce an output.');
  }
  return output;
});

export async function sentenceStructureCheck(input: SentenceStructureCheckInput): Promise<SentenceStructureCheckOutput> {
  const validation = SentenceStructureCheckInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for sentenceStructureCheck: ${validation.error.message}`);
  }
  return sentenceStructureCheckFlow(validation.data);
}
