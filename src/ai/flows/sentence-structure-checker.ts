
'use server';

/**
 * @fileOverview An AI agent for analyzing the sentence structure of a text.
 */

import { ai } from '@/ai/genkit';
import { SentenceStructureCheckInputSchema, SentenceStructureCheckOutputSchema, type SentenceStructureCheckInput, type SentenceStructureCheckOutput } from '@/ai/schemas';

const sentenceStructureCheckPrompt = ai.definePrompt({
  name: 'sentenceStructureCheckPrompt',
  input: { schema: SentenceStructureCheckInputSchema },
  // No output schema - model returns plain JSON text
  model: 'ollama/phi3:mini-4k',
  config: {
    // responseSchema removed
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
    const result = await sentenceStructureCheckPrompt(input);
    
    if (!result) {
      throw new Error('No output received from the model.');
    }

    let output: SentenceStructureCheckOutput;
    try {
      const jsonText = result.text || result.output || '';
      output = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse Sentence Structure Check JSON:', parseError);
      throw new Error('Sentence Structure Check returned invalid JSON');
    }

    const validation = SentenceStructureCheckOutputSchema.safeParse(output);
    if (!validation.success) {
      console.error('Sentence Structure Check output validation failed:', validation.error);
      throw new Error('Sentence Structure Check output does not match expected structure');
    }

    return validation.data;
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
