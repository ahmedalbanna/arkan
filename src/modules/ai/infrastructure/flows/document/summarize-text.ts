
'use server';

/**
 * @fileOverview An AI agent for summarizing text.
 */

import { ai, MODEL_BY_TASK, OLLAMA_MODELS } from '@/modules/ai/infrastructure/services/Genkit';
import { SummarizeInputSchema, SummarizeLength, SummarizeOutputSchema, type SummarizeInput, type SummarizeOutput } from '@/modules/ai/domain/schemas';
import { RECOMMENDED_TEMPERATURES } from '@/modules/ai/domain/utils/json-output-validator';
import z from 'zod';

const lengthDescriptions: Record<SummarizeLength, string> = {
    short: "a single, concise paragraph (approximately 50-100 words).",
    medium: "a few paragraphs, capturing the main points and key supporting details (approximately 150-300 words).",
    long: "a detailed summary, covering all significant topics and arguments (approximately 400-600 words).",
};

const summarizePrompt = ai.definePrompt({
    name: 'summarizeTextPrompt',
    input: { schema: z.object({ text: z.string(), instruction: z.string() }) },
    model: OLLAMA_MODELS.GEMMA_2B,
    config: {
        temperature: RECOMMENDED_TEMPERATURES.PRECISE,
    },
    prompt: `You are a professional text summarizer.

**Task:**
- Read the text below carefully
- Create a summary that is {{{instruction}}}

**Text to Summarize:**
---
{{{text}}}
---

Output ONLY the summary text. Do NOT include any preamble, filler, or JSON wrapping.`,
});

const summarizeTextFlow = ai.defineFlow({
    name: 'summarizeTextFlow',
    inputSchema: SummarizeInputSchema,
    outputSchema: SummarizeOutputSchema
}, async (input: SummarizeInput) => {
    const lengthKey = (input.length || 'medium') as SummarizeLength;
    const instruction = lengthDescriptions[lengthKey] || lengthDescriptions.medium;
    
    try {
        const result = await summarizePrompt({ ...input, instruction });

        const text = result.text || result.output || "";
        if (!text || text.trim().length === 0) {
            throw new Error('Model returned empty summary');
        }

        return text.trim();
    } catch (error) {
        console.error('Error in summarizeTextFlow:', error);
        throw new Error(`Failed to summarize text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
});

export async function summarizeText(input: SummarizeInput): Promise<SummarizeOutput> {
    const validation = SummarizeInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for summarizeText: ${validation.error.message}`);
    }
    
    try {
        return await summarizeTextFlow(validation.data);
    } catch (error) {
        console.error('Error in summarizeText:', error);
        throw error;
    }
}
