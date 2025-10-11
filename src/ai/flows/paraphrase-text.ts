'use server';

/**
 * @fileOverview An AI agent for paraphrasing text in different styles.
 */

import { ai } from '@/ai/genkit';
import { paraphraseTextPrompt } from '@/ai/prompts/paraphrase-text';
import { ParaphraseInputSchema, ParaphraseOutputSchema, type ParaphraseInput, type ParaphraseOutput } from '@/ai/schemas';


const paraphraseTextFlow = ai.defineFlow({
    name: 'paraphraseTextFlow',
    inputSchema: ParaphraseInputSchema,
    outputSchema: ParaphraseOutputSchema,
}, async (input) => {
    const { text, mode } = input;

    const { output } = await paraphraseTextPrompt({ text, mode });
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
