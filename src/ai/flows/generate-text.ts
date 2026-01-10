
'use server';

/**
 * @fileOverview A text generation AI agent.
 *
 * - generateText - A function that handles the text generation process.
 * - GenerateTextInput - The input type for the generateText function.
 * - GenerateTextOutput - The return type for the generateText function.
 */

import { ai } from '@/ai/genkit';
import { GenerateTextInputSchema, GenerateTextOutputSchema, type GenerateTextInput, type GenerateTextOutput } from '@/ai/schemas';

// Note: This flow now needs to be called with a user-specific AI instance.
// The API route will handle creating this instance based on the user's stored keys.
export async function generateText(input: GenerateTextInput): Promise<GenerateTextOutput> {


  const promptTemplate = ai.definePrompt({
    name: 'generateTextPrompt',
    input: { schema: GenerateTextInputSchema },
    output: { schema: GenerateTextOutputSchema },
    model: 'ollama/gemma:2b',
    prompt: `You are a writing assistant. Generate text based on the following prompt.
Your output must be a valid JSON object that adheres to the defined schema.

Prompt: {{{prompt}}}

Generated Text:`,
  });

  const generateTextFlow = ai.defineFlow(
    {
      name: 'generateTextFlow',
      inputSchema: GenerateTextInputSchema,
      outputSchema: GenerateTextOutputSchema,
    },
    async (flowInput) => {
      const { output } = await promptTemplate(flowInput);
      return output!;
    }
  );

  return generateTextFlow(input);
}
