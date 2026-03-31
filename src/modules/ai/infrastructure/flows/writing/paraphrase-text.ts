
'use server';

/**
 * @fileOverview An AI agent for paraphrasing text in different styles.
 */

import { ai, MODEL_BY_TASK } from '@/modules/ai/infrastructure/services/Genkit';
import { ParaphraseInputSchema, ParaphraseOutputSchema, type ParaphraseInput, type ParaphraseMode, type ParaphraseOutput } from '@/modules/ai/domain/schemas';

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
    model: 'ollama/gemma:2b',
    prompt: `You are an expert editor. Your task is to paraphrase the given text based on the selected mode. You must perfectly preserve all markdown formatting.

**Mode**: {{{mode}}}
**Instruction**: {{{instruction}}}

**Original Text:**
---
{{{text}}}
---

Output ONLY the paraphrased text. Do NOT include any preamble, filler, or JSON wrapping.`,
});

const paraphraseTextFlow = ai.defineFlow({
    name: 'paraphraseTextFlow',
    inputSchema: ParaphraseInputSchema,
    outputSchema: ParaphraseOutputSchema,
}, async (input: ParaphraseInput) => {
    const mode = (input.mode || 'standard') as ParaphraseMode;
    const instruction = styleDescriptions[mode] || styleDescriptions.standard;
    const result = await paraphrasePrompt({ text: input.text, mode: input.mode, instruction } as any);
    
    const text = (result.text || result.output || "").replace(/---/g, '').trim();
    if (!text) {
        throw new Error("Failed to paraphrase text.");
    }
    
    return text;
});

export async function paraphraseText(input: ParaphraseInput): Promise<ParaphraseOutput> {
    const validation = ParaphraseInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for paraphraseText: ${validation.error.message}`);
    }
    return paraphraseTextFlow(validation.data);
}
