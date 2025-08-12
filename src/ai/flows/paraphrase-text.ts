
'use server';

/**
 * @fileOverview An AI agent for paraphrasing text in different styles.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const ParaphraseModeSchema = z.enum(['standard', 'fluent', 'formal', 'creative', 'simplify']);
export type ParaphraseMode = z.infer<typeof ParaphraseModeSchema>;

const ParaphraseInputSchema = z.object({
  text: z.string().describe('The text to be paraphrased.'),
  mode: ParaphraseModeSchema.describe('The desired style of the paraphrased text.'),
});
export type ParaphraseInput = z.infer<typeof ParaphraseInputSchema>;


const ParaphraseOutputSchema = z.object({
  paraphrasedText: z.string().describe('The rewritten text, with original markdown formatting preserved.'),
});
export type ParaphraseOutput = z.infer<typeof ParaphraseOutputSchema>;

const styleDescriptions: Record<ParaphraseMode, string> = {
    standard: "Provide a balanced rewrite that improves clarity while retaining the original meaning.",
    fluent: "Rewrite the text to sound more natural and fluent, as if written by a native speaker.",
    formal: "Rewrite the text using a more formal, academic, and professional tone.",
    creative: "Rewrite the text in a more creative and engaging style, using vivid language.",
    simplify: "Rewrite the text to be simpler and easier to understand for a general audience.",
};

export async function paraphraseText(input: ParaphraseInput): Promise<ParaphraseOutput> {
  const { text, mode } = input;

  const prompt = ai.definePrompt({
    name: 'paraphraseTextPrompt',
    input: { schema: ParaphraseInputSchema },
    output: { schema: ParaphraseOutputSchema },
    prompt: `You are an expert editor. Your task is to paraphrase the given text based on the selected mode. You must perfectly preserve all markdown formatting.

**Mode**: {{{mode}}}
**Instruction**: ${styleDescriptions[mode]}

**Original Text:**
---
{{{text}}}
---

**Paraphrased Text:**`,
  });

  const { output } = await prompt({ text, mode });
  if (!output) {
      throw new Error("Failed to paraphrase text.");
  }
  output.paraphrasedText = output.paraphrasedText.replace(/---/g, '').trim();
  return output;
}
