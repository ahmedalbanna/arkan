
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
import { validateJsonOutput, getJsonPromptInstructions, RECOMMENDED_TEMPERATURES } from '@/ai/utils/json-output-validator';

const prompt = ai.definePrompt({
  name: 'manipulateTextPrompt',
  input: { schema: ManipulateTextInputSchema },
  output: { schema: ManipulateTextOutputSchema },
  model: 'ollama/gemma:2b',
  config: {
    responseSchema: ManipulateTextOutputSchema,
    temperature: RECOMMENDED_TEMPERATURES.BALANCED,
  },
  prompt: `You are an expert editor. A user has provided a piece of text and a command for how to change it. Your task is to follow the command and return the rewritten text.

${getJsonPromptInstructions(`{
  "manipulatedText": "Your rewritten text based on the command"
}`)}

**Command:** {{{command}}}

**Original Text:**
---
{{{textToManipulate}}}
---

**JSON Output:**`,
});

const manipulateTextFlow = ai.defineFlow(
  {
    name: 'manipulateTextFlow',
    inputSchema: ManipulateTextInputSchema,
    outputSchema: ManipulateTextOutputSchema,
  },
  async ({ textToManipulate, command }) => {
    try {
      const { output } = await prompt({ textToManipulate, command });
      
      if (!output) {
        throw new Error('No output received from the model.');
      }

      const validation = validateJsonOutput({
        schema: ManipulateTextOutputSchema,
        output,
        flowName: 'manipulateTextFlow',
        attemptRecovery: true,
        enableLogging: true,
        fallbackFn: (rawOutput) => {
          if (typeof rawOutput === 'string') {
            return { manipulatedText: rawOutput };
          }
          return null;
        },
      });

      if (!validation.success) {
        throw new Error(validation.error || 'Failed to validate output');
      }

      return validation.data!;
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
