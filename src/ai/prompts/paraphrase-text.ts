'use server';

import { ai } from '@/ai/genkit';
import { ParaphraseInputSchema, ParaphraseMode, ParaphraseOutputSchema } from '@/ai/schemas';

const styleDescriptions: Record<ParaphraseMode, string> = {
    standard: "Provide a balanced rewrite that improves clarity while retaining the original meaning.",
    fluent: "Rewrite the text to sound more natural and fluent, as if written by a native speaker.",
    formal: "Rewrite the text using a more formal, academic, and professional tone.",
    creative: "Rewrite the text in a more creative and engaging style, using vivid language.",
    simplify: "Rewrite the text to be simpler and easier to understand for a general audience.",
};

export const paraphraseTextPrompt = ai.definePrompt({
    name: 'paraphraseTextPrompt',
    input: { schema: ParaphraseInputSchema },
    output: { schema: ParaphraseOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert editor. Your task is to paraphrase the given text based on the selected mode. You must perfectly preserve all markdown formatting.

**Mode**: {{{mode}}}
**Instruction**: ${styleDescriptions[ParaphraseMode.standard]}

**Original Text:**
---
{{{text}}}
---

**Paraphrased Text:**`,
});
