

'use server';

/**
 * @fileOverview An AI agent for extracting text content from an image.
 * - imageToText
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ImageToTextInputSchema, type ImageToTextInput, ImageToTextOutputSchema, type ImageToTextOutput } from '@/ai/schemas';


export async function imageToText(input: ImageToTextInput): Promise<ImageToTextOutput> {
  return imageToTextFlow(input);
}

const imageToTextFlow = ai.defineFlow(
  {
    name: 'imageToTextFlow',
    inputSchema: ImageToTextInputSchema,
    outputSchema: ImageToTextOutputSchema,
  },
  async (input) => {
    const extractTextPrompt = ai.definePrompt({
      name: 'extractTextFromImagePrompt',
      input: { schema: ImageToTextInputSchema },
      output: { schema: ImageToTextOutputSchema },
      model: 'googleai/gemini-1.5-flash',
      prompt: `You are an expert OCR (Optical Character Recognition) tool. Your task is to take the provided image and extract all text content from it.

Follow these guidelines:
1.  **Structure**: Analyze the image to understand the layout. Preserve the original structure as much as possible, including headings, lists, and paragraphs.
2.  **Accuracy**: Extract the text as accurately as possible.
3.  **Formatting**: Format the output as clean markdown.

Image:
---
{{media url=imageDataUri}}
---
`,
    });

    const { output } = await extractTextPrompt(input);
    if (!output) {
      throw new Error("Text extraction failed.");
    }
    output.text = output.text.replace(/---/g, '').trim();
    return output;
  }
);
