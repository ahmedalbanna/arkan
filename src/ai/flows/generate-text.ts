
'use server';

/**
 * @fileOverview A text generation AI agent.
 *
 * - generateText - A function that handles the text generation process.
 * - GenerateTextInput - The input type for the generateText function.
 * - GenerateTextOutput - The return type for the generateText function.
 */

import { ai } from '@/ai/genkit';
import { generateTextPrompt } from '@/ai/prompts/generate-text';
import { GenerateTextInputSchema, GenerateTextOutputSchema, type GenerateTextInput, type GenerateTextOutput } from '@/ai/schemas';

export async function generateText(input: GenerateTextInput): Promise<GenerateTextOutput> {
  return generateTextFlow(input);
}

const generateTextFlow = ai.defineFlow(
  {
    name: 'generateTextFlow',
    inputSchema: GenerateTextInputSchema,
    outputSchema: GenerateTextOutputSchema,
  },
  async input => {
    const { output } = await generateTextPrompt(input);
    return output!;
  }
);
