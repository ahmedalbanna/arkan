'use server';

/**
 * @fileOverview An AI agent for extracting text content from an image.
 * - imageToText
 */

import { ai } from '@/ai/genkit';
import { extractTextPrompt } from '@/ai/prompts/image-to-text';
import { ImageToTextInputSchema, ImageToTextOutputSchema, type ImageToTextInput, type ImageToTextOutput } from '@/ai/schemas';

const imageToTextFlow = ai.defineFlow(
  {
    name: 'imageToTextFlow',
    inputSchema: ImageToTextInputSchema,
    outputSchema: ImageToTextOutputSchema,
  },
  async (input) => {
    const { output } = await extractTextPrompt(input);
    if (!output) {
      throw new Error("Text extraction failed.");
    }
    output.text = output.text.replace(/---/g, '').trim();
    return output;
  }
);


export async function imageToText(input: ImageToTextInput): Promise<ImageToTextOutput> {
  const validation = ImageToTextInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for imageToText: ${validation.error.message}`);
  }
  return imageToTextFlow(validation.data);
}
