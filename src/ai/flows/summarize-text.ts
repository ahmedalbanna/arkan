
'use server';

/**
 * @fileOverview An AI agent for summarizing text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const SummarizeLengthSchema = z.enum(['short', 'medium', 'long']);
export type SummarizeLength = z.infer<typeof SummarizeLengthSchema>;

const SummarizeInputSchema = z.object({
  text: z.string().describe('The text to be summarized.'),
  length: SummarizeLengthSchema.describe('The desired length of the summary.'),
});
export type SummarizeInput = z.infer<typeof SummarizeInputSchema>;


const SummarizeOutputSchema = z.object({
  summary: z.string().describe('The generated summary of the original text.'),
});
export type SummarizeOutput = z.infer<typeof SummarizeOutputSchema>;

const lengthDescriptions: Record<SummarizeLength, string> = {
    short: "a single, concise paragraph.",
    medium: "a few paragraphs, capturing the main points and key supporting details.",
    long: "a detailed summary, covering all significant topics and arguments.",
};

export async function summarizeText(input: SummarizeInput): Promise<SummarizeOutput> {
  const { text, length } = input;

  const prompt = ai.definePrompt({
    name: 'summarizeTextPrompt',
    input: { schema: SummarizeInputSchema },
    output: { schema: SummarizeOutputSchema },
    prompt: `You are an expert summarizer. Your task is to read the provided text and generate a summary of the specified length.

**Desired Length**: The summary should be ${lengthDescriptions[length]}

**Original Text:**
---
{{{text}}}
---

**Summary:**`,
  });

  const { output } = await prompt({ text, length });
  if (!output) {
      throw new Error("Failed to summarize text.");
  }
  output.summary = output.summary.replace(/---/g, '').trim();
  return output;
}
