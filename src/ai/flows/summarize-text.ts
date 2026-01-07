
'use server';

/**
 * @fileOverview An AI agent for summarizing text.
 */

import { ai } from '@/ai/genkit';
import { SummarizeInputSchema, SummarizeLength, SummarizeOutputSchema, type SummarizeInput, type SummarizeOutput } from '@/lib/schemas';
import z from 'zod';

const lengthDescriptions: Record<SummarizeLength, string> = {
    short: "a single, concise paragraph.",
    medium: "a few paragraphs, capturing the main points and key supporting details.",
    long: "a detailed summary, covering all significant topics and arguments.",
};

const summarizePrompt = ai.definePrompt({
    name: 'summarizeTextPrompt',
    input: { schema: z.object({ text: z.string(), instruction: z.string() }) },
    output: { schema: SummarizeOutputSchema },
    model: 'googleai/gemini-2.5-flash-lite',
    prompt: `You are an expert summarizer. Your task is to read the provided text and generate a summary of the specified length.

**Desired Length**: The summary should be {{{instruction}}}

**Original Text:**
---
{{{text}}}
---

**Summary:`,
    config: {
        temperature: 0.5,
    }
});

const summarizeTextFlow = ai.defineFlow({
    name: 'summarizeTextFlow',
    inputSchema: SummarizeInputSchema,
    outputSchema: SummarizeOutputSchema
}, async (input) => {
    const instruction = lengthDescriptions[input.length] || lengthDescriptions.medium;
    const { output } = await summarizePrompt({ ...input, instruction });

    if (!output) {
        throw new Error("Failed to summarize text.");
    }
    output.summary = output.summary.replace(/---/g, '').trim();
    return output;
});

export async function summarizeTextWithRatio(input: SummarizeInput): Promise<SummarizeOutput> {
    const validation = SummarizeInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for summarizeText: ${validation.error.message}`);
    }
    return summarizeTextFlow(validation.data);
}
export async function summarizeText(input: SummarizeInput): Promise<SummarizeOutput> {
    const validation = SummarizeInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for summarizeText: ${validation.error.message}`);
    }
    return summarizeTextFlow(validation.data);
}
