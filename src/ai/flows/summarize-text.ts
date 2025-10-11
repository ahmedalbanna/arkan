'use server';

/**
 * @fileOverview An AI agent for summarizing text.
 */

import { ai } from '@/ai/genkit';
import { summarizeTextPrompt } from '@/ai/prompts/summarize-text';
import { SummarizeInputSchema, SummarizeOutputSchema, type SummarizeInput, type SummarizeOutput } from '@/ai/schemas';

const summarizeTextFlow = ai.defineFlow({
    name: 'summarizeTextFlow',
    inputSchema: SummarizeInputSchema,
    outputSchema: SummarizeOutputSchema
}, async (input) => {
    const { text, length } = input;

    const { output } = await summarizeTextPrompt({ text, length });
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
