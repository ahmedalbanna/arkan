
'use server';

/**
 * @fileOverview An AI agent for making text sound more human-like.
 */

import { ai, MODEL_BY_TASK, OLLAMA_MODELS } from '@/modules/ai/infrastructure/services/Genkit';
import { HumanizeTextInputSchema, HumanizeTextOutputSchema, type HumanizeTextInput, type HumanizeTextOutput } from '@/modules/ai/domain/schemas';

const humanizeTextPrompt = ai.definePrompt({
  name: 'humanizeTextPrompt',
  input: { schema: HumanizeTextInputSchema },
  model: OLLAMA_MODELS.GEMMA_2B,
  config: {
    temperature: 0.9, // Balanced high temperature for creativity
  },

  prompt: `You are a world-class editor and ghostwriter specializing in subtlety and authenticity. Your goal is to rewrite the text to be indistinguishable from high-quality human writing.

Rewrite the provided text based on these principles:
- **Natural Rhythm:** Mix short, punchy sentences with longer, complex ones.
- **Authentic Voice:** Avoid AI clichés. Use a rich, varied vocabulary.
- **Break Predictable Structures:** Vary paragraph openings and section flow.
- **Natural Cadence:** Use natural contractions and smooth transitions.
- **Preserve Meaning & Formatting:** Maintain original intent and markdown.

**Original AI Text:**
{{{text}}}

Output ONLY the humanized text. Do NOT include any preamble, filler, or JSON wrapping.`,
});

const humanizeTextFlow = ai.defineFlow({
  name: 'humanizeTextFlow',
  inputSchema: HumanizeTextInputSchema,
  outputSchema: HumanizeTextOutputSchema,
}, async (input: HumanizeTextInput) => {
  try {
    const result = await humanizeTextPrompt(input);
    
    const text = result.text || result.output || "";
    if (!text || text.trim().length === 0) {
      throw new Error('Model returned empty text');
    }

    return text.trim();
  } catch (error) {
    console.error('Error in humanizeTextFlow:', error);
    throw new Error(`Text humanization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

export async function humanizeText(input: HumanizeTextInput): Promise<HumanizeTextOutput> {
  const validation = HumanizeTextInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for humanizeText: ${validation.error.message}`);
  }
  return humanizeTextFlow(validation.data);
}
