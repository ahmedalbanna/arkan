
'use server';

/**
 * @fileOverview An AI agent for analyzing the sentence structure of a text.
 */

import { ai } from '@/ai/genkit';
import { validateJsonOutput, getJsonPromptInstructions, RECOMMENDED_TEMPERATURES } from '@/ai/utils/json-output-validator';
import { SentenceStructureCheckInputSchema, SentenceStructureCheckOutputSchema, type SentenceStructureCheckInput, type SentenceStructureCheckOutput } from '@/ai/schemas';

const sentenceStructureCheckPrompt = ai.definePrompt({
  name: 'sentenceStructureCheckPrompt',
  input: { schema: SentenceStructureCheckInputSchema },
  output: { schema: SentenceStructureCheckOutputSchema },
  model: 'ollama/gemma:2b',
  config: {
    responseSchema: SentenceStructureOutputSchema,
    temperature: 0.2,
  },

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

**JSON Output:**`,
});

const sentenceStructureCheckFlow = ai.defineFlow({
  name: 'sentenceStructureCheckFlow',
  inputSchema: SentenceStructureCheckInputSchema,
  outputSchema: SentenceStructureCheckOutputSchema,
}, async (input) => {
  try {
    const { output } = await sentenceStructureCheckPrompt(input);
    
    if (!output) {
      throw new Error('No output received from the model.');
    }

    const validation = validateJsonOutput({
      schema: SentenceStructureCheckOutputSchema,
      output,
      flowName: 'sentenceStructureCheckFlow',
      attemptRecovery: true,
      enableLogging: true,
    });

    if (!validation.success) {
      throw new Error(validation.error || 'Failed to validate output');
    }

    return validation.data!;
  } catch (error) {
    console.error('Error in sentenceStructureCheckFlow:', error);
    throw new Error(`sentenceStructureCheck failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

export async function sentenceStructureCheck(input: SentenceStructureCheckInput): Promise<SentenceStructureCheckOutput> {
  const validation = SentenceStructureCheckInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for sentenceStructureCheck: ${validation.error.message}`);
  }
  return sentenceStructureCheckFlow(validation.data);
}
