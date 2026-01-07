
'use server';

/**
 * @fileOverview A text generation AI agent.
 *
 * - generateText - A function that handles the text generation process.
 * - GenerateTextInput - The input type for the generateText function.
 * - GenerateTextOutput - The return type for the generateText function.
 */

import { configureUserAi } from '@/ai/genkit';
import { GenerateTextInputSchema, GenerateTextOutputSchema, type GenerateTextInput, type GenerateTextOutput } from '@/lib/schemas';

// Note: This flow now needs to be called with a user-specific AI instance.
// The API route will handle creating this instance based on the user's stored keys.
export async function generateText(input: GenerateTextInput, userApiKeys?: Record<string, string>): Promise<GenerateTextOutput> {
  const ai = configureUserAi(userApiKeys);

  const promptTemplate = ai.definePrompt({
    name: 'generateTextPrompt',
    input: { schema: GenerateTextInputSchema },
    output: { schema: GenerateTextOutputSchema },
    model: 'googleai/gemini-2.5-flash-lite',
    prompt: `You are a writing assistant. Generate text based on the following prompt.

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
