'use server';

import { ai } from '@/ai/genkit';
import { SummarizeInputSchema, SummarizeLength, SummarizeOutputSchema } from '@/ai/schemas';

const lengthDescriptions: Record<SummarizeLength, string> = {
    short: "a single, concise paragraph.",
    medium: "a few paragraphs, capturing the main points and key supporting details.",
    long: "a detailed summary, covering all significant topics and arguments.",
};

export const summarizeTextPrompt = ai.definePrompt({
    name: 'summarizeTextPrompt',
    input: { schema: SummarizeInputSchema },
    output: { schema: SummarizeOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert summarizer. Your task is to read the provided text and generate a summary of the specified length.

**Desired Length**: The summary should be ${lengthDescriptions[SummarizeLength.medium]}

**Original Text:**
---
{{{text}}}
---

**Summary:**`,
    config: {
        temperature: 0.5,
    }
});
