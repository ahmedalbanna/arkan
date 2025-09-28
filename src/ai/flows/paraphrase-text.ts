'use server';

/**
 * @fileOverview An AI agent for paraphrasing text in different styles.
 */

import { ai } from '@/ai/genkit';
import { ParaphraseInputSchema, ParaphraseOutputSchema, type ParaphraseInput, type ParaphraseMode, type ParaphraseOutput } from '@/ai/schemas';

const styleDescriptions: Record<ParaphraseMode, string> = {
    standard: "Provide a balanced rewrite that improves clarity while retaining the original meaning.",
    fluent: "Rewrite the text to sound more natural and fluent, as if written by a native speaker.",
    formal: "Rewrite the text using a more formal, academic, and professional tone.",
    creative: "Rewrite the text in a more creative and engaging style, using vivid language.",
    simplify: "Rewrite the text to be simpler and easier to understand for a general audience.",
};


const paraphraseTextFlow = ai.defineFlow({
    name: 'paraphraseTextFlow',
    inputSchema: ParaphraseInputSchema,
    outputSchema: ParaphraseOutputSchema,
}, async (input) => {
    const { text, mode } = input;

    const paraphrasePrompt = ai.definePrompt({
        name: 'paraphraseTextPrompt',
        input: { schema: ParaphraseInputSchema },
        output: { schema: ParaphraseOutputSchema },
        model: 'googleai/gemini-2.0-flash',
        prompt: `You are an expert editor. Your task is to paraphrase the given text based on the selected mode. You must perfectly preserve all markdown formatting.

**Mode**: {{{mode}}}
**Instruction**: ${styleDescriptions[mode]}

**Original Text:**
---
{{{text}}}
---

**Paraphrased Text:**`,
    });

    const { output } = await paraphrasePrompt({ text, mode });
    if (!output) {
        throw new Error("Failed to paraphrase text.");
    }
    output.paraphrasedText = output.paraphrasedText.replace(/---/g, '').trim();
    return output;
});

export async function paraphraseText(input: ParaphraseInput): Promise<ParaphraseOutput> {
    const validation = ParaphraseInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for paraphraseText: ${validation.error.message}`);
    }
    return paraphraseTextFlow(validation.data);
}
