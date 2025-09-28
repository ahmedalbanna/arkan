'use server';

/**
 * @fileOverview An AI agent for summarizing text.
 */

import { ai } from '@/ai/genkit';
import { SummarizeInputSchema, SummarizeLength, SummarizeOutputSchema, type SummarizeInput, type SummarizeOutput } from '@/ai/schemas';

const lengthDescriptions: Record<SummarizeLength, string> = {
    short: "a single, concise paragraph.",
    medium: "a few paragraphs, capturing the main points and key supporting details.",
    long: "a detailed summary, covering all significant topics and arguments.",
};

const summarizeTextFlow = ai.defineFlow({
    name: 'summarizeTextFlow',
    inputSchema: SummarizeInputSchema,
    outputSchema: SummarizeOutputSchema
}, async (input) => {
    const { text, length } = input;

    const summarizePrompt = ai.definePrompt({
        name: 'summarizeTextPrompt',
        input: { schema: SummarizeInputSchema },
        output: { schema: SummarizeOutputSchema },
        model: 'googleai/gemini-2.0-flash',
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

    const { output } = await summarizePrompt({ text, length });
    if (!output) {
        throw new Error("Failed to summarize text.");
    }
    output.summary = output.summary.replace(/---/g, '').trim();
    return output;
});


export async function summarizeText(input: SummarizeInput): Promise<SummarizeOutput> {
    const validation = SummarizeInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for summarizeText: ${validation.error.message}`);
    }
    return summarizeTextFlow(validation.data);
}
