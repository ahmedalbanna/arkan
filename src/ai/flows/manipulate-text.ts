

'use server';

/**
 * @fileOverview An AI agent for manipulating text based on commands.
 * - manipulateText
 */

import { ai } from '@/ai/genkit';
import { manipulateTextPrompt } from '@/ai/prompts/manipulate-text';
import {
  ManipulateTextInputSchema,
  ManipulateTextOutputSchema,
  type ManipulateTextInput,
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
    const { output } = await manipulateTextPrompt({ textToManipulate, command });
    return output!;
  }
);
