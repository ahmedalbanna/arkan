
'use server';

/**
 * @fileOverview An AI agent for manipulating text based on commands.
 * - manipulateText
 */

import { ai } from '@/ai/genkit';
import {
  ManipulateTextInputSchema,
  ManipulateTextOutputSchema,
  type ManipulateTextInput,
  type ManipulateTextOutput,
} from '@/ai/schemas';

const prompt = ai.definePrompt({
  name: 'manipulateTextPrompt',
  input: { schema: ManipulateTextInputSchema },
  output: { schema: ManipulateTextOutputSchema },
  model: 'ollama/gemma:2b',
  prompt: `You are an expert editor. A user has provided a piece of text and a command for how to change it. Your task is to follow the command and return the rewritten text.
Your output must be a valid JSON object that adheres to the defined schema.

Command: {{{command}}}

Original Text:
---
{{{textToManipulate}}}
---
`,
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
  async ({ textToManipulate, command }) => {
    const { output } = await prompt({ textToManipulate, command });
    return output!;
  }
);

export async function manipulateText(
  input: ManipulateTextInput
): Promise<ManipulateTextOutput> {
  return manipulateTextFlow(input);
}
