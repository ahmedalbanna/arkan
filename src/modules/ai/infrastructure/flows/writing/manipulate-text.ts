
'use server';

/**
 * @fileOverview An AI agent for manipulating text based on commands.
 * - manipulateText
 */

import { ai, MODEL_BY_TASK, OLLAMA_MODELS } from '@/modules/ai/infrastructure/services/Genkit';
import {
  ManipulateTextInputSchema,
  ManipulateTextOutputSchema,
  type ManipulateTextInput,
  type ManipulateTextOutput,
} from '@/modules/ai/domain/schemas';

const prompt = ai.definePrompt({
  name: 'manipulateTextPrompt',
  input: { schema: ManipulateTextInputSchema },
  model: OLLAMA_MODELS.GEMMA_2B,
  prompt: `You are an expert editor. A user has provided a piece of text and a command for how to change it. Your task is to follow the command and return the rewritten text.

Command: {{{command}}}

Original Text:
---
{{{textToManipulate}}}
---

Output ONLY the manipulated text. Do NOT include any preamble, filler, or JSON wrapping.`,
  config: {
    temperature: 0.5,
  }
});

const manipulateTextFlow = ai.defineFlow(
  {
    name: 'manipulateTextFlow',
    inputSchema: ManipulateTextInputSchema,
    outputSchema: ManipulateTextOutputSchema,
  },
  async ({ textToManipulate, command }: any) => {
    const result = await prompt({textToManipulate, command });
    const text = result.text || result.output || "";
    if (!text) throw new Error("Failed to manipulate text.");
    return text.trim();
  }
);

export async function manipulateText(
  input: ManipulateTextInput
): Promise<ManipulateTextOutput> {
  return manipulateTextFlow(input);
}
