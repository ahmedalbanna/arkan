
'use server';

/**
 * @fileOverview An AI agent for paraphrasing text in different styles.
 */

import { ai } from '@/ai/genkit';
import { ParaphraseInputSchema, ParaphraseOutputSchema, type ParaphraseInput, type ParaphraseMode, type ParaphraseOutput } from '@/ai/schemas';
import { RECOMMENDED_TEMPERATURES } from '@/ai/utils/json-output-validator';

const styleDescriptions: Record<ParaphraseMode, string> = {
    standard: "Provide a balanced rewrite that improves clarity while retaining the original meaning.",
    fluent: "Rewrite the text to sound more natural and fluent, as if written by a native speaker.",
    formal: "Rewrite the text using a more formal, academic, and professional tone.",
    creative: "Rewrite the text in a more creative and engaging style, using vivid language.",
    simplify: "Rewrite the text to be simpler and easier to understand for a general audience.",
};

const paraphrasePrompt = ai.definePrompt({
    name: 'paraphraseTextPrompt',
    input: { schema: ParaphraseInputSchema },
    // No output schema - model returns plain text
    model: 'ollama/gemma:2b',
    config: {
        temperature: RECOMMENDED_TEMPERATURES.CREATIVE,
    },
    prompt: `You are an expert editor. Your task is to paraphrase the given text based on the selected mode. You must perfectly preserve all markdown formatting.

Output ONLY the paraphrased text. Do NOT wrap it in JSON or any other format.

**Mode**: {{{mode}}}
**Instruction**: {{{instruction}}}

**Original Text:**
---
{{{text}}}
---`,
});

const paraphraseTextFlow = ai.defineFlow({
    name: 'paraphraseTextFlow',
    inputSchema: ParaphraseInputSchema,
    outputSchema: ParaphraseOutputSchema,
}, async (input) => {
    try {
        const instruction = styleDescriptions[input.mode] || styleDescriptions.standard;
        const result = await paraphrasePrompt({ text: input.text, mode: input.mode, instruction } as any);
        
        if (!result) {
            throw new Error("No output received from the model.");
        }

        // Wrap the plain text in the expected output structure
        let paraphrasedText = result.text || result.output || '';
        
        // Clean up any markdown separators
        paraphrasedText = paraphrasedText.replace(/---/g, '').trim();

        const output: ParaphraseOutput = {
            paraphrasedText
        };

        if (!output.paraphrasedText || output.paraphrasedText.length === 0) {
            throw new Error('Model returned empty text');
        }
        
        return output;
    } catch (error) {
        console.error('Error in paraphraseTextFlow:', error);
        throw new Error(`Paraphrasing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
});

export async function paraphraseText(input: ParaphraseInput): Promise<ParaphraseOutput> {
    const validation = ParaphraseInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for paraphraseText: ${validation.error.message}`);
    }
    return paraphraseTextFlow(validation.data);
}
