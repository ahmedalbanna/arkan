
'use server';

/**
 * @fileOverview An AI agent for analyzing a set of context files based on a user prompt
 * and generating a structured JSON output with a dynamic schema.
 */

import { ai } from '@/ai/genkit';
import { analysisPrompt } from '@/ai/prompts/analyze-context';
import { AnalyzeContextInputSchema, AnalyzeContextOutputSchema, type AnalyzeContextInput, type AnalyzeContextOutput } from '@/ai/schemas';

const analyzeContextFlow = ai.defineFlow({
    name: 'analyzeContextFlow',
    inputSchema: AnalyzeContextInputSchema,
    outputSchema: AnalyzeContextOutputSchema,
}, async (input) => {
    const { prompt, contextFiles } = input;
    // Separate media from text files
    const textFiles = contextFiles.filter(f => !f.content.startsWith('data:'));
    const mediaFiles = contextFiles.filter(f => f.content.startsWith('data:'));

    const { output } = await analysisPrompt({ prompt, textFiles, mediaFiles });
    if (!output) {
        throw new Error('Context analysis failed to produce an output.');
    }
    return output;
});

export async function analyzeContext(input: AnalyzeContextInput): Promise<AnalyzeContextOutput> {
    const validation = AnalyzeContextInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for analyzeContext: ${validation.error.message}`);
    }
    return analyzeContextFlow(validation.data);
}
