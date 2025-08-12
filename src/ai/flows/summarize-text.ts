

'use server';

/**
 * @fileOverview An AI agent for summarizing text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { SummarizeInputSchema, type SummarizeInput, SummarizeLength, SummarizeOutputSchema, type SummarizeOutput } from '@/ai/schemas';

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
    model: 'googleai/gemini-1.5-flash',
    prompt: `You are an expert summarizer. Your task is to read the provided text and generate a summary of the specified length.

**Desired Length**: The summary should be ${lengthDescriptions[length]}

**Original Text:**
---
{{{text}}}
---

**Summary:**`,
    config: {
        temperature: 0.5,
    }
  });

  const { output } = await prompt({ text, length });
  if (!output) {
      throw new Error("Failed to summarize text.");
  }
  output.summary = output.summary.replace(/---/g, '').trim();
  return output;
}
