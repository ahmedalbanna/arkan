
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
import { RECOMMENDED_TEMPERATURES } from '@/ai/utils/json-output-validator';

const prompt = ai.definePrompt({
  name: 'manipulateTextPrompt',
  input: { schema: ManipulateTextInputSchema },
  // No output schema - model returns plain text
  model: 'ollama/gemma:2b',
  config: {
    temperature: RECOMMENDED_TEMPERATURES.BALANCED,
  },
  prompt: `You are an expert editor. A user has provided a piece of text and a command for how to change it. Your task is to follow the command and return the rewritten text.

Output ONLY the rewritten text. Do NOT wrap it in JSON or any other format.

**Command:** {{{command}}}

**Original Text:**
---
{{{textToManipulate}}}
---`,
});

const manipulateTextFlow = ai.defineFlow(
  {
    name: 'manipulateTextFlow',
    inputSchema: ManipulateTextInputSchema,
    outputSchema: ManipulateTextOutputSchema,
  },
  async ({ textToManipulate, command }) => {
    try {
      const result = await prompt({ textToManipulate, command });
      
      if (!result) {
        throw new Error('No output received from the model.');
      }

      // Wrap the plain text in the expected output structure
      const output: ManipulateTextOutput = {
        manipulatedText: result.text || result.output || ''
      };

      if (!output.manipulatedText || output.manipulatedText.trim().length === 0) {
        throw new Error('Model returned empty text');
      }

      return output;
    } catch (error) {
      console.error('Error in manipulateTextFlow:', error);
      throw new Error(`Text manipulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export async function manipulateText(
  input: ManipulateTextInput
): Promise<ManipulateTextOutput> {
  return manipulateTextFlow(input);
}
