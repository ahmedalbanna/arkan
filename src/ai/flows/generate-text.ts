
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

export async function generateText(input: GenerateTextInput): Promise<GenerateTextOutput> {
  return generateTextFlow(input);
}

const promptTemplate = ai.definePrompt({
  name: 'generateTextPrompt',
  input: { schema: GenerateTextInputSchema },
  output: { schema: GenerateTextOutputSchema },
  model: 'googleai/gemini-2.0-flash',
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
  async input => {
    const { output } = await promptTemplate(input);
    return output!;
  }
);
