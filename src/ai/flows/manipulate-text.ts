

'use server';

/**
 * @fileOverview An AI agent for manipulating text based on commands.
 * - manipulateText
 */

import { ai } from '@/ai/genkit';
import {
  ManipulateTextInputSchema,
  type ManipulateTextInput,
  ManipulateTextOutputSchema,
  type ManipulateTextOutput,
} from '@/ai/schemas';

export async function manipulateText(
  input: ManipulateTextInput
): Promise<ManipulateTextOutput> {
  return manipulateTextFlow(input);
}

const manipulateTextFlow = ai.defineFlow(
  {
    name: 'manipulateTextFlow',
    inputSchema: ManipulateTextInputSchema,
    outputSchema: ManipulateTextOutputSchema,
  },
  async ({ textToManipulate, command }) => {
    const prompt = ai.definePrompt({
      name: 'manipulateTextPrompt',
      input: { schema: ManipulateTextInputSchema },
      output: { schema: ManipulateTextOutputSchema },
      model: 'googleai/gemini-1.5-flash',
      prompt: `You are an expert editor. A user has provided a piece of text and a command for how to change it. Your task is to follow the command and return only the rewritten text.

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

    const { output } = await prompt({ textToManipulate, command });
    return output!;
  }
);
