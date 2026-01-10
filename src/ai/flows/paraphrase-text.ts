
'use server';

/**
 * @fileOverview An AI agent for paraphrasing text in different styles.
 */

import { ai } from '@/ai/genkit';
import { ParaphraseInputSchema, ParaphraseOutputSchema, type ParaphraseInput, type ParaphraseMode, type ParaphraseOutput } from '@/ai/schemas';
import { validateJsonOutput, getJsonPromptInstructions, RECOMMENDED_TEMPERATURES } from '@/ai/utils/json-output-validator';

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
    output: { schema: ParaphraseOutputSchema },
    model: 'ollama/gemma:2b',
    config: {
        responseSchema: ParaphraseOutputSchema,
        temperature: RECOMMENDED_TEMPERATURES.CREATIVE,
    },
    prompt: `You are an expert editor. Your task is to paraphrase the given text based on the selected mode. You must perfectly preserve all markdown formatting.

${getJsonPromptInstructions(`{
  "paraphrasedText": "Your paraphrased text here with markdown preserved"
}`)}

**Mode**: {{{mode}}}
**Instruction**: {{{instruction}}}

**Original Text:**
---
{{{text}}}
---

**JSON Output:**`,
});

const paraphraseTextFlow = ai.defineFlow({
    name: 'paraphraseTextFlow',
    inputSchema: ParaphraseInputSchema,
    outputSchema: ParaphraseOutputSchema,
}, async (input) => {
    try {
        const instruction = styleDescriptions[input.mode] || styleDescriptions.standard;
        const { output } = await paraphrasePrompt({ text: input.text, mode: input.mode, instruction } as any);
        
        if (!output) {
            throw new Error("No output received from the model.");
        }

        const validation = validateJsonOutput({
            schema: ParaphraseOutputSchema,
            output,
            flowName: 'paraphraseTextFlow',
            attemptRecovery: true,
            enableLogging: true,
            fallbackFn: (rawOutput) => {
                if (typeof rawOutput === 'string') {
                    return { paraphrasedText: rawOutput };
                }
                return null;
            },
        });

        if (!validation.success) {
            throw new Error(validation.error || 'Failed to validate output');
        }

        // Clean up any markdown separators
        const result = validation.data!;
        result.paraphrasedText = result.paraphrasedText.replace(/---/g, '').trim();
        
        return result;
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
