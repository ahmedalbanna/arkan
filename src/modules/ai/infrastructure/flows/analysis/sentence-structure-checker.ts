
'use server';

/**
 * @fileOverview An AI agent for analyzing the sentence structure of a text.
 */

import { ai, OLLAMA_MODELS } from '@/modules/ai/infrastructure/services/Genkit';
import { SentenceStructureCheckInputSchema, SentenceStructureCheckOutputSchema, type SentenceStructureCheckInput, type SentenceStructureCheckOutput } from '@/modules/ai/domain/schemas';

const sentenceStructureCheckPrompt = ai.definePrompt({
  name: 'sentenceStructureCheckPrompt',
  input: { schema: SentenceStructureCheckInputSchema },
  // No output schema - model returns plain JSON text
  model: OLLAMA_MODELS.GEMMA_2B,
  config: {
    temperature: 0.2,
  },

  prompt: `You are an expert writing analyst. Analyze the text for sentence structure, variety, and flow.
Provide specific suggestions for improvement.

**Text to Analyze:**
---
{{{text}}}
---

Output ONLY the analysis in markdown format. Do NOT include any preamble, filler, or JSON wrapping.`,
});

const sentenceStructureCheckFlow = ai.defineFlow({
  name: 'sentenceStructureCheck',
  inputSchema: SentenceStructureCheckInputSchema,
  outputSchema: SentenceStructureCheckOutputSchema,
}, async (input: SentenceStructureCheckInput) => {
  try {
    const result = await sentenceStructureCheckPrompt(input);
    const text = result.text || result.output || "";
    if (!text) {
      throw new Error('No output received from the model.');
    }
    return text.trim();
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
